alter table "public"."game" add column "max_ap" integer not null default 255;

alter table "public"."puzzle_config" add column "ap_gain" smallint not null default '0'::smallint;

alter table "public"."game" add constraint "game_max_ap_check" CHECK ((max_ap > 0)) not valid;

alter table "public"."game" validate constraint "game_max_ap_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_max_action_points()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$begin
  return (SELECT max_ap FROM game WHERE game.id = 1);
end;$function$
;

CREATE TRIGGER gain_ap_on_puzzle_solve AFTER UPDATE ON public.puzzle FOR EACH ROW EXECUTE FUNCTION gain_ap_on_puzzle_solve();
