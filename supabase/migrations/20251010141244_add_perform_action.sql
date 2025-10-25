alter table "public"."actions" add column "strength" smallint not null default 10;

alter table "public"."actions" add constraint "actions_strength_check" CHECK ((strength > 0)) not valid;

alter table "public"."actions" validate constraint "actions_strength_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_attack_damage_for_point_based_on_faction(a_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$DECLARE
    v_count_of_users_at_point INTEGER;
BEGIN
  select (get_count_of_active_users_at_point_by_user_id(a_user_id)) INTO v_count_of_users_at_point;

  return (select Least(
    (SELECT game.user_max_damage FROM game WHERE game.id = 1),
    (SELECT game.user_base_damage FROM game WHERE game.id = 1) + (
    (v_count_of_users_at_point - 1) *
    (SELECT game.group_attack_multiplier_per_user FROM game WHERE game.id = 1)
  )) * v_count_of_users_at_point);
END;$function$
;

CREATE OR REPLACE FUNCTION public.perform_action()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare

  v_point point;

begin

  --- type
  IF (new.type = 'attack') THEN
    UPDATE point
    SET health =  (
      (select point.health from point where point.id = new.point) -
      new.strength
    )
    WHERE point.id = new.point;
  END IF;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.can_user_perform_action_on_point(a_user_id uuid, a_poind_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE
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
END$function$
;

CREATE OR REPLACE FUNCTION public.is_puzzle_solved(a_puzzle_id uuid)
 RETURNS boolean
 LANGUAGE sql
AS $function$SELECT solved
FROM puzzle
WHERE puzzle.id = a_puzzle_id$function$
;

CREATE TRIGGER perform_action_on_insert AFTER INSERT ON public.actions FOR EACH ROW EXECUTE FUNCTION perform_action();
