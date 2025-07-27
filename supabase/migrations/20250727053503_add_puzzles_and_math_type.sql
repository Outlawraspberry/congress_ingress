create table "public"."puzzle" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "task" jsonb not null,
    "type" "puzzle-type" not null,
    "solved" boolean not null default false,
    "timeout" boolean not null default false
);


alter table "public"."puzzle" enable row level security;

create table "public"."puzzle_result" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "result" jsonb not null
);


alter table "public"."puzzle_result" enable row level security;

CREATE UNIQUE INDEX puzzle_pkey ON public.puzzle USING btree (id);

CREATE UNIQUE INDEX puzzle_result_pkey ON public.puzzle_result USING btree (id);

alter table "public"."puzzle" add constraint "puzzle_pkey" PRIMARY KEY using index "puzzle_pkey";

alter table "public"."puzzle_result" add constraint "puzzle_result_pkey" PRIMARY KEY using index "puzzle_result_pkey";

alter table "public"."puzzle" add constraint "puzzle_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."puzzle" validate constraint "puzzle_user_id_fkey";

alter table "public"."puzzle_result" add constraint "puzzle_result_id_fkey" FOREIGN KEY (id) REFERENCES puzzle(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."puzzle_result" validate constraint "puzzle_result_id_fkey";

alter table "public"."puzzle_result" add constraint "puzzle_result_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."puzzle_result" validate constraint "puzzle_result_user_id_fkey";

grant delete on table "public"."puzzle" to "anon";

grant insert on table "public"."puzzle" to "anon";

grant references on table "public"."puzzle" to "anon";

grant select on table "public"."puzzle" to "anon";

grant trigger on table "public"."puzzle" to "anon";

grant truncate on table "public"."puzzle" to "anon";

grant update on table "public"."puzzle" to "anon";

grant delete on table "public"."puzzle" to "authenticated";

grant insert on table "public"."puzzle" to "authenticated";

grant references on table "public"."puzzle" to "authenticated";

grant select on table "public"."puzzle" to "authenticated";

grant trigger on table "public"."puzzle" to "authenticated";

grant truncate on table "public"."puzzle" to "authenticated";

grant update on table "public"."puzzle" to "authenticated";

grant delete on table "public"."puzzle" to "service_role";

grant insert on table "public"."puzzle" to "service_role";

grant references on table "public"."puzzle" to "service_role";

grant select on table "public"."puzzle" to "service_role";

grant trigger on table "public"."puzzle" to "service_role";

grant truncate on table "public"."puzzle" to "service_role";

grant update on table "public"."puzzle" to "service_role";

grant delete on table "public"."puzzle_result" to "anon";

grant insert on table "public"."puzzle_result" to "anon";

grant references on table "public"."puzzle_result" to "anon";

grant select on table "public"."puzzle_result" to "anon";

grant trigger on table "public"."puzzle_result" to "anon";

grant truncate on table "public"."puzzle_result" to "anon";

grant update on table "public"."puzzle_result" to "anon";

grant delete on table "public"."puzzle_result" to "authenticated";

grant insert on table "public"."puzzle_result" to "authenticated";

grant references on table "public"."puzzle_result" to "authenticated";

grant select on table "public"."puzzle_result" to "authenticated";

grant trigger on table "public"."puzzle_result" to "authenticated";

grant truncate on table "public"."puzzle_result" to "authenticated";

grant update on table "public"."puzzle_result" to "authenticated";

grant delete on table "public"."puzzle_result" to "service_role";

grant insert on table "public"."puzzle_result" to "service_role";

grant references on table "public"."puzzle_result" to "service_role";

grant select on table "public"."puzzle_result" to "service_role";

grant trigger on table "public"."puzzle_result" to "service_role";

grant truncate on table "public"."puzzle_result" to "service_role";

grant update on table "public"."puzzle_result" to "service_role";

create policy "Enable insert for users based on user_id"
on "public"."puzzle"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."puzzle"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "public"."puzzle_result"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



