create type "public"."role" as enum ('user', 'admin');

alter table "public"."user" add column "role" role not null default 'user'::role;