-- Add AP cost columns to the game table for different action types
alter table "public"."game" add column "attack_ap_cost" smallint not null default '10'::smallint;
alter table "public"."game" add column "claim_ap_cost" smallint not null default '15'::smallint;
alter table "public"."game" add column "repair_ap_cost" smallint not null default '8'::smallint;

-- Add constraints to ensure AP costs are positive
alter table "public"."game" add constraint "game_attack_ap_cost_check" CHECK ((attack_ap_cost > 0)) not valid;
alter table "public"."game" validate constraint "game_attack_ap_cost_check";

alter table "public"."game" add constraint "game_claim_ap_cost_check" CHECK ((claim_ap_cost > 0)) not valid;
alter table "public"."game" validate constraint "game_claim_ap_cost_check";

alter table "public"."game" add constraint "game_repair_ap_cost_check" CHECK ((repair_ap_cost > 0)) not valid;
alter table "public"."game" validate constraint "game_repair_ap_cost_check";

-- Function to get AP cost for a specific action type
CREATE OR REPLACE FUNCTION public.get_ap_cost_for_action(a_action_type task_type)
 RETURNS smallint
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (
    CASE a_action_type
      WHEN 'attack' THEN (SELECT attack_ap_cost FROM game WHERE id = 1)
      WHEN 'attack_and_claim' THEN (SELECT attack_ap_cost + claim_ap_cost FROM game WHERE id = 1)
      WHEN 'claim' THEN (SELECT claim_ap_cost FROM game WHERE id = 1)
      WHEN 'repair' THEN (SELECT repair_ap_cost FROM game WHERE id = 1)
      ELSE 0
    END
  );
END;
$function$;

-- Function to check if user has enough AP for an action
CREATE OR REPLACE FUNCTION public.user_has_enough_ap(a_user_id uuid, a_action_type task_type)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_user_ap integer;
    v_required_ap smallint;
BEGIN
    -- Get user's current AP
    SELECT action_points INTO v_user_ap
    FROM user_game_data
    WHERE user_id = a_user_id;

    -- Get required AP for this action
    SELECT get_ap_cost_for_action(a_action_type) INTO v_required_ap;

    -- Return true if user has enough AP
    RETURN (v_user_ap >= v_required_ap);
END;
$function$;

-- Function to spend AP for an action
CREATE OR REPLACE FUNCTION public.spend_ap_for_action(a_user_id uuid, a_action_type task_type)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_required_ap smallint;
BEGIN
    -- Get required AP for this action
    SELECT get_ap_cost_for_action(a_action_type) INTO v_required_ap;

    -- Deduct AP from user
    UPDATE user_game_data
    SET action_points = action_points - v_required_ap
    WHERE user_id = a_user_id;

    -- Ensure AP doesn't go below 0 (safety check)
    UPDATE user_game_data
    SET action_points = GREATEST(action_points, 0)
    WHERE user_id = a_user_id;
END;
$function$;

-- Keep the original can_user_perform_action_on_point function (AP is checked in perform_action)
CREATE OR REPLACE FUNCTION public.can_user_perform_action_on_point(a_user_id uuid, a_poind_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_last_action TIMESTAMP;
    v_timeout_seconds INTEGER;
    v_exceeded BOOLEAN;
BEGIN
    -- Get last_action for the user
    SELECT last_action INTO v_last_action
    FROM public.user_game_data
    WHERE user_id = a_user_id;

    -- Get timeout value from game table
    SELECT user_last_action_timeout_in_seconds INTO v_timeout_seconds
    FROM game
    WHERE id = 1;

    -- Check if last_action is older than timeout
    v_exceeded := (EXTRACT(EPOCH FROM (NOW() - v_last_action)) > v_timeout_seconds);

    IF v_exceeded = false THEN
        RAISE EXCEPTION 'Timeout exceeded for user % in game %', a_user_id, a_poind_id;
    END IF;

    RETURN v_exceeded;
END;
$function$;

-- Update the existing perform_action function to check and spend AP
CREATE OR REPLACE FUNCTION public.perform_action()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_required_ap smallint;
    v_user_ap integer;
BEGIN
    -- Only allow actions on claimable points
    IF (SELECT type FROM point WHERE id = new.point) != 'claimable' THEN
        RAISE EXCEPTION 'Action not allowed on non-claimable point %', new.point;
    END IF;

    -- Check if user has enough AP for this action
    SELECT get_ap_cost_for_action(new.type) INTO v_required_ap;
    SELECT action_points INTO v_user_ap FROM user_game_data WHERE user_id = new.created_by;

    IF v_user_ap < v_required_ap THEN
        RAISE EXCEPTION 'User % does not have enough AP for action % (required: %, has: %)', new.created_by, new.type, v_required_ap, v_user_ap;
    END IF;

    -- Spend AP for the action
    PERFORM spend_ap_for_action(new.created_by, new.type);

    -- Perform the actual action
    IF (new.type = 'attack' OR new.type = 'attack_and_claim') THEN
        UPDATE point
        SET health = (
            (select point.health from point where point.id = new.point) -
            new.strength
        )
        WHERE point.id = new.point;
    END IF;

    IF ((new.type = 'attack_and_claim' and (select point.health from point where point.id = new.point) <= 0) or (new.type = 'claim' and (select point.acquired_by from point where point.id = new.point) IS NULL)) THEN
        UPDATE point
        SET health = (select point.max_health from point where point.id = new.point),
            acquired_by = (SELECT faction_id from user_game_data WHERE user_id = new.created_by)
        WHERE point.id = new.point;
    END IF;

    IF (new.type = 'repair') THEN
        UPDATE point
        SET health = (
            LEAST (
                (select point.max_health from point where point.id = new.point),
                ((select point.health from point where point.id = new.point) + new.strength)
            )
        )
        WHERE point.id = new.point;
    END IF;

    -- Update user stats
    UPDATE public.user_game_data
    SET last_action = NOW(), experience = experience + new.rewarded_experience
    WHERE public.user_game_data.user_id = new.created_by;

    RETURN new;
END;
$function$;
