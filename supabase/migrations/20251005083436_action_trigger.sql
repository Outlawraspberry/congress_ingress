set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.perform_action()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  --- type
  IF (new.type = 'attack') THEN
    select perform_attack_on_mapping('f2173573-eab5-4155-a655-40e9dc7d1d0e');
  END IF;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.perform_attack_on_point(point_id uuid)
 RETURNS void
 LANGUAGE sql
AS $function$UPDATE point
SET health =  (
  (select point.health from point where point.id = point_id) -
  (select get_attack_damage_for_point(point_id))
)
WHERE point.id = point_id;$function$
;

CREATE TRIGGER run_on_action_was_added AFTER INSERT ON public.actions FOR EACH ROW EXECUTE FUNCTION perform_action();


