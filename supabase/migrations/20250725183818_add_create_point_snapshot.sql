set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_point_archive_snapshot()
 RETURNS void
 LANGUAGE sql
AS $function$INSERT INTO point_tick_archive (point_id, health, acquired_by)
SELECT id, health, acquired_by
FROM point;$function$
;

create policy "service role is allowed to create snapshot"
on "public"."point_tick_archive"
as permissive
for insert
to service_role
with check (true);



