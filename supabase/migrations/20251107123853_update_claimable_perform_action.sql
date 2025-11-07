CREATE OR REPLACE FUNCTION public.perform_action()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
begin

  --- Only allow actions on claimable points
  IF (SELECT type FROM point WHERE id = new.point) != 'claimable' THEN
    RAISE EXCEPTION 'Action not allowed on non-claimable point %', new.point;
  END IF;

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
  SET last_action = NOW(), experience = experience + new.rewarded_experience
  WHERE public.user_game_data.user_id = new.created_by;

  return new;
end;$function$
;
