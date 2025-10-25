set check_function_bodies = off;

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
            RAISE EXCEPTION 'Timeout exceeded for user % in game %. now %, last_action %, diff %', a_user_id, a_poind_id, NOW(), v_last_action, NOW() - v_last_action;
    END IF;

    RETURN true;
END$function$
;

CREATE OR REPLACE FUNCTION public.perform_action()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
begin

  --- type
  IF (new.type = 'attack' OR new.type = 'attack_and_claim') THEN
    UPDATE point
    SET health =  (
      (select point.health from point where point.id = new.point) -
      new.strength
    )
    WHERE point.id = new.point;
  END IF;

  IF ((new.type = 'attack_and_claim' and (select point.health from point where point.id = new.point) <= 0) or (new.type = 'claim' and (select point.acquired_by from point where point.id = new.point) IS NULL)) THEN  
  
    UPDATE point
    SET health = (select point.max_health from point where point.id = new.point), acquired_by = (SELECT faction_id from user_game_data WHERE user_id = new.created_by)
    WHERE point.id = new.point;

  END IF;

  IF (new.type = 'repair') THEN
    UPDATE point
    SET health = (
      LEAST (
        (select point.max_health from point where point.id = new.point), ((select point.health from point where point.id = new.point) +
        new.strength)
      )
    )
    WHERE point.id = new.point;
  END IF;

  UPDATE public.user_game_data
  SET last_action = NOW()
  WHERE public.user_game_data.user_id = new.created_by;

  return new;
end;$function$
;


