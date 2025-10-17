drop function if exists "public"."set_timeout_for_expired_puzzles"();

alter table "public"."puzzle" drop column "timeout";

alter table "public"."puzzle" add column "expires_at" timestamp with time zone default (now() + '00:00:10'::interval);

alter table "public"."puzzle" alter column "expires_at" set not null;
