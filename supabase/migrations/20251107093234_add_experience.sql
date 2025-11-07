alter table "public"."actions" add column "rewarded_experience" smallint not null default '0'::smallint;

alter table "public"."user_game_data" add column "experience" bigint not null default '0'::bigint;

alter table "public"."actions" add constraint "actions_rewarded_experience_check" CHECK ((rewarded_experience >= 0)) not valid;

alter table "public"."actions" validate constraint "actions_rewarded_experience_check";

alter table "public"."user_game_data" add constraint "user_game_data_experience_check" CHECK ((experience >= 0)) not valid;

alter table "public"."user_game_data" validate constraint "user_game_data_experience_check";

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

  UPDATE public.user_game_data
  SET last_action = NOW(), experience = experience + new.rewarded_experience
  WHERE public.user_game_data.user_id = new.created_by;

  return new;
end;$function$
;


