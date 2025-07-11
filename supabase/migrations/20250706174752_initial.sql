create type "public"."game-state" as enum ('playing', 'paused');

create type "public"."task_type" as enum ('attack', 'attack_and_claim', 'repair', 'claim');

create table "public"."fraction" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


alter table "public"."fraction" enable row level security;

create table "public"."game" (
    "tick" bigint not null,
    "state" "game-state" not null default 'paused'::"game-state"
);


alter table "public"."public" enable row level security;

create table "public"."point" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "max_health" smallint not null default '255'::smallint,
    "name" text not null
);


alter table "public"."point" enable row level security;

create table "public"."tick_point" (
    "created_at" timestamp with time zone not null default now(),
    "point_id" uuid not null,
    "tick" bigint not null,
    "health" smallint not null,
    "acquired_by" uuid not null
);


alter table "public"."tick_point" enable row level security;

create table "public"."tick_task" (
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null default gen_random_uuid(),
    "tick" bigint not null,
    "point" uuid not null,
    "type" task_type not null
);


alter table "public"."tick_task" enable row level security;

create table "public"."user" (
    "id" uuid not null,
    "fraction" uuid not null,
    "name" text not null
);


alter table "public"."user" enable row level security;

CREATE UNIQUE INDEX fraction_name_key ON public.fraction USING btree (name);

CREATE UNIQUE INDEX fraction_pkey ON public.fraction USING btree (id);

CREATE UNIQUE INDEX point_name_key ON public.point USING btree (name);

CREATE UNIQUE INDEX point_pkey ON public.point USING btree (id);

CREATE UNIQUE INDEX tick_point_pkey ON public.tick_point USING btree (point_id, tick);

CREATE UNIQUE INDEX tick_task_pkey ON public.tick_task USING btree (created_by, tick);

CREATE UNIQUE INDEX user_pkey ON public."user" USING btree (id);

alter table "public"."fraction" add constraint "fraction_pkey" PRIMARY KEY using index "fraction_pkey";

alter table "public"."point" add constraint "point_pkey" PRIMARY KEY using index "point_pkey";

alter table "public"."tick_point" add constraint "tick_point_pkey" PRIMARY KEY using index "tick_point_pkey";

alter table "public"."tick_task" add constraint "tick_task_pkey" PRIMARY KEY using index "tick_task_pkey";

alter table "public"."user" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."fraction" add constraint "fraction_name_key" UNIQUE using index "fraction_name_key";

alter table "public"."point" add constraint "point_name_key" UNIQUE using index "point_name_key";

alter table "public"."tick_point" add constraint "tick_point_acquired_by_fkey" FOREIGN KEY (acquired_by) REFERENCES public.fraction(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."tick_point" validate constraint "tick_point_acquired_by_fkey";

alter table "public"."tick_point" add constraint "tick_point_point_id_fkey" FOREIGN KEY (point_id) REFERENCES public.point(id) not valid;

alter table "public"."tick_point" validate constraint "tick_point_point_id_fkey";

alter table "public"."tick_task" add constraint "tick_task_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."tick_task" validate constraint "tick_task_created_by_fkey";

alter table "public"."tick_task" add constraint "tick_task_point_fkey" FOREIGN KEY (point) REFERENCES public.point(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."tick_task" validate constraint "tick_task_point_fkey";

alter table "public"."user" add constraint "user_fraction_fkey" FOREIGN KEY (fraction) REFERENCES public.fraction(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."user" validate constraint "user_fraction_fkey";

alter table "public"."user" add constraint "user_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user" validate constraint "user_id_fkey";

-- For public.tick_point.acquired_by → public.fraction(id)
COMMENT ON CONSTRAINT tick_point_acquired_by_fkey ON public.tick_point IS '@graphql({"local_name": "acquiredByFraction", "foreign_name": "acquiredTickPoints"})';

-- For public.tick_point.point_id → public.point(id)
COMMENT ON CONSTRAINT tick_point_point_id_fkey ON public.tick_point IS '@graphql({"local_name": "point", "foreign_name": "tickPoints"})';

-- For public.tick_task.created_by → auth.users(id)
COMMENT ON CONSTRAINT tick_task_created_by_fkey ON public.tick_task IS '@graphql({"local_name": "createdByUser", "foreign_name": "createdTickTasks"})';

-- For public.tick_task.point → public.point(id)
COMMENT ON CONSTRAINT tick_task_point_fkey ON public.tick_task IS '@graphql({"local_name": "point", "foreign_name": "tickTasks"})';

-- For public.user.fraction → public.fraction(id)
COMMENT ON CONSTRAINT user_fraction_fkey ON public."user" IS '@graphql({"local_name": "fraction", "foreign_name": "users"})';

-- For public.user.id → auth.users(id)
COMMENT ON CONSTRAINT user_id_fkey ON public."user" IS '@graphql({"local_name": "authUser", "foreign_name": "publicUsers"})';


GRANT USAGE ON SCHEMA public TO anon,
authenticated,
service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,
authenticated,
service_role;

GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon,
authenticated,
service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon,
authenticated,
service_role;

alter table "public"."user" alter column "name" set default ''::text;

CREATE UNIQUE INDEX user_name_key ON public."user" USING btree (name);

alter table "public"."user" add constraint "user_name_check" CHECK ((length(name) < 50)) not valid;

alter table "public"."user" validate constraint "user_name_check";

alter table "public"."user" add constraint "user_name_key" UNIQUE using index "user_name_key";

create policy "Enable read access for all users"
on "public"."fraction"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."public"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."point"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."tick_point"
as permissive
for select
to public
using (true);


create policy "Enable delete for users based on user_id"
on "public"."tick_task"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable insert for users based on user_id"
on "public"."tick_task"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable update for users based on user_id"
on "public"."tick_task"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable insert for users based on user_id"
on "public"."user"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "public"."user"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));
