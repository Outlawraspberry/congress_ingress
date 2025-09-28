create table "public"."point_user" (
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "point_id" uuid not null
);


alter table "public"."point_user" enable row level security;

alter table "public"."game" add column "point_user_kick_timeout_seconds" smallint not null default '90'::smallint;

CREATE UNIQUE INDEX point_user_pkey ON public.point_user USING btree (user_id, point_id);

alter table "public"."point_user" add constraint "point_user_pkey" PRIMARY KEY using index "point_user_pkey";

alter table "public"."point_user" add constraint "point_user_point_id_fkey" FOREIGN KEY (point_id) REFERENCES point_mapping(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."point_user" validate constraint "point_user_point_id_fkey";

alter table "public"."point_user" add constraint "point_user_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."point_user" validate constraint "point_user_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.kick_users_from_point_user()
 RETURNS void
 LANGUAGE sql
AS $function$DELETE FROM public.point_user WHERE created_at IS NOT NULL AND created_at < now() - ( SELECT make_interval(secs => point_user_kick_timeout_seconds) FROM public.game WHERE id = '1' );$function$
;

grant delete on table "public"."point_user" to "anon";

grant insert on table "public"."point_user" to "anon";

grant references on table "public"."point_user" to "anon";

grant select on table "public"."point_user" to "anon";

grant trigger on table "public"."point_user" to "anon";

grant truncate on table "public"."point_user" to "anon";

grant update on table "public"."point_user" to "anon";

grant delete on table "public"."point_user" to "authenticated";

grant insert on table "public"."point_user" to "authenticated";

grant references on table "public"."point_user" to "authenticated";

grant select on table "public"."point_user" to "authenticated";

grant trigger on table "public"."point_user" to "authenticated";

grant truncate on table "public"."point_user" to "authenticated";

grant update on table "public"."point_user" to "authenticated";

grant delete on table "public"."point_user" to "service_role";

grant insert on table "public"."point_user" to "service_role";

grant references on table "public"."point_user" to "service_role";

grant select on table "public"."point_user" to "service_role";

grant trigger on table "public"."point_user" to "service_role";

grant truncate on table "public"."point_user" to "service_role";

grant update on table "public"."point_user" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."point_user"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for authenticated users only"
on "public"."point_user"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for users based on email"
on "public"."point_user"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can see where other users are"
on "public"."point_user"
as permissive
for select
to authenticated
using (true);

create extension if not exists pg_cron;

select cron.schedule(
  '10 seconds',
  $$ select public.kick_users_from_point_user(); $$
);
