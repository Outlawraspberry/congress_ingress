set check_function_bodies = off;

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

  return new;
end;$function$
;


