ALTER PUBLICATION supabase_realtime ADD TABLE public.tick_point;

ALTER PUBLICATION supabase_realtime ADD TABLE public.game;

drop policy "Enable read access for all users" on "public"."tick_task";

drop policy "Enable update for users based on user_id" on "public"."tick_task";

alter table "public"."tick_task" drop constraint "tick_task_pkey";

drop index if exists "public"."tick_task_pkey";

alter table "public"."tick_task" drop column "id";

CREATE UNIQUE INDEX tick_task_pkey ON public.tick_task USING btree (created_by, tick);

alter table "public"."tick_task" add constraint "tick_task_pkey" PRIMARY KEY using index "tick_task_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.select_point_at_current_tick(p_point_id uuid)
 RETURNS record
 LANGUAGE sql
AS $function$SELECT * FROM tick_point WHERE tick=(select get_current_tick()) AND point_id = p_point_id;$function$
;

create policy "Enable users to view their own data only"
on "public"."tick_task"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable update for users based on user_id"
on "public"."tick_task"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = created_by));