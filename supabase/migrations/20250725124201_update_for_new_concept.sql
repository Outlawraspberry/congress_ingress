create type "public"."puzzle-type" as enum ('math');

drop policy "Enable read access for all users" on "public"."fraction";

drop policy "Enable read access for authenticated users" on "public"."tick_point";

drop policy "Enable delete for users based on user_id" on "public"."tick_task";

drop policy "Enable insert for users based on user_id" on "public"."tick_task";

drop policy "Enable update for users based on user_id" on "public"."tick_task";

drop policy "Enable users to view their own data only" on "public"."tick_task";

revoke delete on table "public"."fraction" from "anon";

revoke insert on table "public"."fraction" from "anon";

revoke references on table "public"."fraction" from "anon";

revoke select on table "public"."fraction" from "anon";

revoke trigger on table "public"."fraction" from "anon";

revoke truncate on table "public"."fraction" from "anon";

revoke update on table "public"."fraction" from "anon";

revoke delete on table "public"."fraction" from "authenticated";

revoke insert on table "public"."fraction" from "authenticated";

revoke references on table "public"."fraction" from "authenticated";

revoke select on table "public"."fraction" from "authenticated";

revoke trigger on table "public"."fraction" from "authenticated";

revoke truncate on table "public"."fraction" from "authenticated";

revoke update on table "public"."fraction" from "authenticated";

revoke delete on table "public"."fraction" from "service_role";

revoke insert on table "public"."fraction" from "service_role";

revoke references on table "public"."fraction" from "service_role";

revoke select on table "public"."fraction" from "service_role";

revoke trigger on table "public"."fraction" from "service_role";

revoke truncate on table "public"."fraction" from "service_role";

revoke update on table "public"."fraction" from "service_role";

revoke delete on table "public"."tick_point" from "anon";

revoke insert on table "public"."tick_point" from "anon";

revoke references on table "public"."tick_point" from "anon";

revoke select on table "public"."tick_point" from "anon";

revoke trigger on table "public"."tick_point" from "anon";

revoke truncate on table "public"."tick_point" from "anon";

revoke update on table "public"."tick_point" from "anon";

revoke delete on table "public"."tick_point" from "authenticated";

revoke insert on table "public"."tick_point" from "authenticated";

revoke references on table "public"."tick_point" from "authenticated";

revoke select on table "public"."tick_point" from "authenticated";

revoke trigger on table "public"."tick_point" from "authenticated";

revoke truncate on table "public"."tick_point" from "authenticated";

revoke update on table "public"."tick_point" from "authenticated";

revoke delete on table "public"."tick_point" from "service_role";

revoke insert on table "public"."tick_point" from "service_role";

revoke references on table "public"."tick_point" from "service_role";

revoke select on table "public"."tick_point" from "service_role";

revoke trigger on table "public"."tick_point" from "service_role";

revoke truncate on table "public"."tick_point" from "service_role";

revoke update on table "public"."tick_point" from "service_role";

revoke delete on table "public"."tick_task" from "anon";

revoke insert on table "public"."tick_task" from "anon";

revoke references on table "public"."tick_task" from "anon";

revoke select on table "public"."tick_task" from "anon";

revoke trigger on table "public"."tick_task" from "anon";

revoke truncate on table "public"."tick_task" from "anon";

revoke update on table "public"."tick_task" from "anon";

revoke delete on table "public"."tick_task" from "authenticated";

revoke insert on table "public"."tick_task" from "authenticated";

revoke references on table "public"."tick_task" from "authenticated";

revoke select on table "public"."tick_task" from "authenticated";

revoke trigger on table "public"."tick_task" from "authenticated";

revoke truncate on table "public"."tick_task" from "authenticated";

revoke update on table "public"."tick_task" from "authenticated";

revoke delete on table "public"."tick_task" from "service_role";

revoke insert on table "public"."tick_task" from "service_role";

revoke references on table "public"."tick_task" from "service_role";

revoke select on table "public"."tick_task" from "service_role";

revoke trigger on table "public"."tick_task" from "service_role";

revoke truncate on table "public"."tick_task" from "service_role";

revoke update on table "public"."tick_task" from "service_role";

alter table "public"."fraction" drop constraint "fraction_name_key";

alter table "public"."tick_point" drop constraint "tick_point_acquired_by_fkey";

alter table "public"."tick_point" drop constraint "tick_point_point_id_fkey";

alter table "public"."tick_task" drop constraint "tick_task_created_by_fkey";

alter table "public"."tick_task" drop constraint "tick_task_point_fkey";

alter table "public"."user" drop constraint "user_fraction_fkey";

alter table "public"."fraction" drop constraint "fraction_pkey";

alter table "public"."tick_point" drop constraint "tick_point_pkey";

alter table "public"."tick_task" drop constraint "tick_task_pkey";

drop index if exists "public"."tick_task_pkey";

drop index if exists "public"."fraction_name_key";

drop index if exists "public"."fraction_pkey";

drop index if exists "public"."tick_point_pkey";

drop table "public"."fraction";

drop table "public"."tick_point";

drop table "public"."tick_task";

create table "public"."actions" (
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null,
    "point" uuid not null,
    "type" task_type not null
);


alter table "public"."actions" enable row level security;

create table "public"."faction" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


alter table "public"."faction" enable row level security;

create table "public"."point_tick_archive" (
    "created_at" timestamp with time zone not null default now(),
    "point_id" uuid not null,
    "acquired_by" uuid,
    "health" smallint
);


alter table "public"."point_tick_archive" enable row level security;

create table "public"."user_game_data" (
    "user_id" uuid not null default gen_random_uuid(),
    "faction_id" uuid,
    "last_action" timestamp with time zone
);


alter table "public"."user_game_data" enable row level security;

create table "public"."user_role" (
    "user_id" uuid not null default gen_random_uuid(),
    "role" role not null default 'user'::role
);


alter table "public"."user_role" enable row level security;

alter table "public"."game" drop column "tick";

alter table "public"."point" add column "acquired_by" uuid;

alter table "public"."point" add column "health" smallint not null default '255'::smallint;

alter table "public"."user" drop column "fraction";

alter table "public"."user" drop column "role";

CREATE UNIQUE INDEX actions_pkey ON public.actions USING btree (created_at, created_by);

CREATE UNIQUE INDEX user_game_data_pkey ON public.user_game_data USING btree (user_id);

CREATE UNIQUE INDEX user_role_pkey ON public.user_role USING btree (user_id);

CREATE UNIQUE INDEX fraction_name_key ON public.faction USING btree (name);

CREATE UNIQUE INDEX fraction_pkey ON public.faction USING btree (id);

CREATE UNIQUE INDEX tick_point_pkey ON public.point_tick_archive USING btree (created_at, point_id);

alter table "public"."actions" add constraint "actions_pkey" PRIMARY KEY using index "actions_pkey";

alter table "public"."faction" add constraint "fraction_pkey" PRIMARY KEY using index "fraction_pkey";

alter table "public"."point_tick_archive" add constraint "tick_point_pkey" PRIMARY KEY using index "tick_point_pkey";

alter table "public"."user_game_data" add constraint "user_game_data_pkey" PRIMARY KEY using index "user_game_data_pkey";

alter table "public"."user_role" add constraint "user_role_pkey" PRIMARY KEY using index "user_role_pkey";

alter table "public"."actions" add constraint "tick_task_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."actions" validate constraint "tick_task_created_by_fkey";

alter table "public"."actions" add constraint "tick_task_point_fkey" FOREIGN KEY (point) REFERENCES point(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."actions" validate constraint "tick_task_point_fkey";

alter table "public"."faction" add constraint "fraction_name_key" UNIQUE using index "fraction_name_key";

alter table "public"."point" add constraint "point_acquired_by_fkey" FOREIGN KEY (acquired_by) REFERENCES faction(id) not valid;

alter table "public"."point" validate constraint "point_acquired_by_fkey";

alter table "public"."point" add constraint "point_health_check" CHECK ((health <= 255)) not valid;

alter table "public"."point" validate constraint "point_health_check";

alter table "public"."point_tick_archive" add constraint "tick_point_acquired_by_fkey" FOREIGN KEY (acquired_by) REFERENCES faction(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."point_tick_archive" validate constraint "tick_point_acquired_by_fkey";

alter table "public"."point_tick_archive" add constraint "tick_point_point_id_fkey" FOREIGN KEY (point_id) REFERENCES point(id) not valid;

alter table "public"."point_tick_archive" validate constraint "tick_point_point_id_fkey";

alter table "public"."user_game_data" add constraint "user_game_data_faction_id_fkey" FOREIGN KEY (faction_id) REFERENCES faction(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."user_game_data" validate constraint "user_game_data_faction_id_fkey";

alter table "public"."user_game_data" add constraint "user_game_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_game_data" validate constraint "user_game_data_user_id_fkey";

alter table "public"."user_role" add constraint "user_role_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_role" validate constraint "user_role_user_id_fkey";

grant delete on table "public"."actions" to "anon";

grant insert on table "public"."actions" to "anon";

grant references on table "public"."actions" to "anon";

grant select on table "public"."actions" to "anon";

grant trigger on table "public"."actions" to "anon";

grant truncate on table "public"."actions" to "anon";

grant update on table "public"."actions" to "anon";

grant delete on table "public"."actions" to "authenticated";

grant insert on table "public"."actions" to "authenticated";

grant references on table "public"."actions" to "authenticated";

grant select on table "public"."actions" to "authenticated";

grant trigger on table "public"."actions" to "authenticated";

grant truncate on table "public"."actions" to "authenticated";

grant update on table "public"."actions" to "authenticated";

grant delete on table "public"."actions" to "service_role";

grant insert on table "public"."actions" to "service_role";

grant references on table "public"."actions" to "service_role";

grant select on table "public"."actions" to "service_role";

grant trigger on table "public"."actions" to "service_role";

grant truncate on table "public"."actions" to "service_role";

grant update on table "public"."actions" to "service_role";

grant delete on table "public"."faction" to "anon";

grant insert on table "public"."faction" to "anon";

grant references on table "public"."faction" to "anon";

grant select on table "public"."faction" to "anon";

grant trigger on table "public"."faction" to "anon";

grant truncate on table "public"."faction" to "anon";

grant update on table "public"."faction" to "anon";

grant delete on table "public"."faction" to "authenticated";

grant insert on table "public"."faction" to "authenticated";

grant references on table "public"."faction" to "authenticated";

grant select on table "public"."faction" to "authenticated";

grant trigger on table "public"."faction" to "authenticated";

grant truncate on table "public"."faction" to "authenticated";

grant update on table "public"."faction" to "authenticated";

grant delete on table "public"."faction" to "service_role";

grant insert on table "public"."faction" to "service_role";

grant references on table "public"."faction" to "service_role";

grant select on table "public"."faction" to "service_role";

grant trigger on table "public"."faction" to "service_role";

grant truncate on table "public"."faction" to "service_role";

grant update on table "public"."faction" to "service_role";

grant delete on table "public"."point_tick_archive" to "anon";

grant insert on table "public"."point_tick_archive" to "anon";

grant references on table "public"."point_tick_archive" to "anon";

grant select on table "public"."point_tick_archive" to "anon";

grant trigger on table "public"."point_tick_archive" to "anon";

grant truncate on table "public"."point_tick_archive" to "anon";

grant update on table "public"."point_tick_archive" to "anon";

grant delete on table "public"."point_tick_archive" to "authenticated";

grant insert on table "public"."point_tick_archive" to "authenticated";

grant references on table "public"."point_tick_archive" to "authenticated";

grant select on table "public"."point_tick_archive" to "authenticated";

grant trigger on table "public"."point_tick_archive" to "authenticated";

grant truncate on table "public"."point_tick_archive" to "authenticated";

grant update on table "public"."point_tick_archive" to "authenticated";

grant delete on table "public"."point_tick_archive" to "service_role";

grant insert on table "public"."point_tick_archive" to "service_role";

grant references on table "public"."point_tick_archive" to "service_role";

grant select on table "public"."point_tick_archive" to "service_role";

grant trigger on table "public"."point_tick_archive" to "service_role";

grant truncate on table "public"."point_tick_archive" to "service_role";

grant update on table "public"."point_tick_archive" to "service_role";

grant delete on table "public"."user_game_data" to "anon";

grant insert on table "public"."user_game_data" to "anon";

grant references on table "public"."user_game_data" to "anon";

grant select on table "public"."user_game_data" to "anon";

grant trigger on table "public"."user_game_data" to "anon";

grant truncate on table "public"."user_game_data" to "anon";

grant update on table "public"."user_game_data" to "anon";

grant delete on table "public"."user_game_data" to "authenticated";

grant insert on table "public"."user_game_data" to "authenticated";

grant references on table "public"."user_game_data" to "authenticated";

grant select on table "public"."user_game_data" to "authenticated";

grant trigger on table "public"."user_game_data" to "authenticated";

grant truncate on table "public"."user_game_data" to "authenticated";

grant update on table "public"."user_game_data" to "authenticated";

grant delete on table "public"."user_game_data" to "service_role";

grant insert on table "public"."user_game_data" to "service_role";

grant references on table "public"."user_game_data" to "service_role";

grant select on table "public"."user_game_data" to "service_role";

grant trigger on table "public"."user_game_data" to "service_role";

grant truncate on table "public"."user_game_data" to "service_role";

grant update on table "public"."user_game_data" to "service_role";

grant delete on table "public"."user_role" to "anon";

grant insert on table "public"."user_role" to "anon";

grant references on table "public"."user_role" to "anon";

grant select on table "public"."user_role" to "anon";

grant trigger on table "public"."user_role" to "anon";

grant truncate on table "public"."user_role" to "anon";

grant update on table "public"."user_role" to "anon";

grant delete on table "public"."user_role" to "authenticated";

grant insert on table "public"."user_role" to "authenticated";

grant references on table "public"."user_role" to "authenticated";

grant select on table "public"."user_role" to "authenticated";

grant trigger on table "public"."user_role" to "authenticated";

grant truncate on table "public"."user_role" to "authenticated";

grant update on table "public"."user_role" to "authenticated";

grant delete on table "public"."user_role" to "service_role";

grant insert on table "public"."user_role" to "service_role";

grant references on table "public"."user_role" to "service_role";

grant select on table "public"."user_role" to "service_role";

grant trigger on table "public"."user_role" to "service_role";

grant truncate on table "public"."user_role" to "service_role";

grant update on table "public"."user_role" to "service_role";

create policy "Enable users to view their own data only"
on "public"."actions"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable read access for all users"
on "public"."faction"
as permissive
for select
to authenticated, service_role
using (true);


create policy "Enable read access for authenticated users"
on "public"."point_tick_archive"
as permissive
for select
to authenticated, service_role
using (true);



