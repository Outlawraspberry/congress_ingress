set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.select_task_of_current_tick()
 RETURNS SETOF record
 LANGUAGE sql
AS $function$select tick_task.created_by, tick_task.point, tick_task.type, public.user.fraction
from public.tick_task

inner join public.user
on public.tick_task.created_by = public.user.id

WHERE public.tick_task.tick = (select get_current_tick());$function$
;


