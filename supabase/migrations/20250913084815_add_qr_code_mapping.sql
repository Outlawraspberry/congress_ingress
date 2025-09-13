create table "public"."point_mapping" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "point_id" uuid not null,
    "is_active" boolean not null default true
);


alter table "public"."point_mapping" enable row level security;

CREATE UNIQUE INDEX "point-mapping_pkey" ON public.point_mapping USING btree (id);

alter table "public"."point_mapping" add constraint "point-mapping_pkey" PRIMARY KEY using index "point-mapping_pkey";

alter table "public"."point_mapping" add constraint "point_mapping_point_id_fkey" FOREIGN KEY (point_id) REFERENCES point(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."point_mapping" validate constraint "point_mapping_point_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_point_by_mapping(a_point_id uuid)
 RETURNS record
 LANGUAGE sql
AS $function$SELECT point.acquired_by, point.created_at, point.health, point.max_health, point.name, point_mapping.id
FROM point
LEFT JOIN point_mapping
ON point.id = point_mapping.point_id
WHERE point_mapping.id = a_point_id;$function$
;

grant delete on table "public"."point_mapping" to "anon";

grant insert on table "public"."point_mapping" to "anon";

grant references on table "public"."point_mapping" to "anon";

grant select on table "public"."point_mapping" to "anon";

grant trigger on table "public"."point_mapping" to "anon";

grant truncate on table "public"."point_mapping" to "anon";

grant update on table "public"."point_mapping" to "anon";

grant delete on table "public"."point_mapping" to "authenticated";

grant insert on table "public"."point_mapping" to "authenticated";

grant references on table "public"."point_mapping" to "authenticated";

grant select on table "public"."point_mapping" to "authenticated";

grant trigger on table "public"."point_mapping" to "authenticated";

grant truncate on table "public"."point_mapping" to "authenticated";

grant update on table "public"."point_mapping" to "authenticated";

grant delete on table "public"."point_mapping" to "service_role";

grant insert on table "public"."point_mapping" to "service_role";

grant references on table "public"."point_mapping" to "service_role";

grant select on table "public"."point_mapping" to "service_role";

grant trigger on table "public"."point_mapping" to "service_role";

grant truncate on table "public"."point_mapping" to "service_role";

grant update on table "public"."point_mapping" to "service_role";

create policy "Enable update for admins"
on "public"."game"
as permissive
for update
to authenticated
using ((( SELECT user_role.role
   FROM user_role
  WHERE (user_role.user_id = (( SELECT (auth.jwt() ->> 'sub'::text)))::uuid)) = 'admin'::role));


create policy "Enable delete only for admins"
on "public"."point_mapping"
as permissive
for delete
to authenticated
using ((( SELECT user_role.role
   FROM user_role
  WHERE (user_role.user_id = (( SELECT (auth.jwt() ->> 'sub'::text)))::uuid)) = 'admin'::role));


create policy "Enable insert only for admins"
on "public"."point_mapping"
as permissive
for insert
to authenticated
with check ((( SELECT user_role.role
   FROM user_role
  WHERE (user_role.user_id = (( SELECT (auth.jwt() ->> 'sub'::text)))::uuid)) = 'admin'::role));


create policy "Enable read only for admins"
on "public"."point_mapping"
as permissive
for select
to authenticated
using ((( SELECT user_role.role
   FROM user_role
  WHERE (user_role.user_id = (( SELECT (auth.jwt() ->> 'sub'::text)))::uuid)) = 'admin'::role));


create policy "Enable update for admins"
on "public"."point_mapping"
as permissive
for update
to authenticated
using ((( SELECT user_role.role
   FROM user_role
  WHERE (user_role.user_id = (( SELECT (auth.jwt() ->> 'sub'::text)))::uuid)) = 'admin'::role));
