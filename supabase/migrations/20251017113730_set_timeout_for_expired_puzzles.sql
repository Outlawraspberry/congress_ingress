create table "public"."puzzle_config" (
    "type" "puzzle-type" not null,
    "timeout" smallint not null
);

INSERT INTO
    public.puzzle_config (type, timeout)
VALUES
    ('math'::"puzzle-type", 10);

alter table "public"."puzzle_config" enable row level security;

CREATE UNIQUE INDEX "puzzle-config_pkey" ON public.puzzle_config USING btree (type);

alter table "public"."puzzle_config" add constraint "puzzle-config_pkey" PRIMARY KEY using index "puzzle-config_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_timeout_for_expired_puzzles()
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN

UPDATE puzzle
SET timeout = true
WHERE puzzle.timeout = false AND puzzle.solved = false AND EXTRACT(EPOCH FROM NOW() - puzzle.created_at) > (SELECT timeout FROM puzzle_config WHERE puzzle_config.type = puzzle.type);

END;$function$
;

grant delete on table "public"."puzzle_config" to "anon";

grant insert on table "public"."puzzle_config" to "anon";

grant references on table "public"."puzzle_config" to "anon";

grant select on table "public"."puzzle_config" to "anon";

grant trigger on table "public"."puzzle_config" to "anon";

grant truncate on table "public"."puzzle_config" to "anon";

grant update on table "public"."puzzle_config" to "anon";

grant delete on table "public"."puzzle_config" to "authenticated";

grant insert on table "public"."puzzle_config" to "authenticated";

grant references on table "public"."puzzle_config" to "authenticated";

grant select on table "public"."puzzle_config" to "authenticated";

grant trigger on table "public"."puzzle_config" to "authenticated";

grant truncate on table "public"."puzzle_config" to "authenticated";

grant update on table "public"."puzzle_config" to "authenticated";

grant delete on table "public"."puzzle_config" to "service_role";

grant insert on table "public"."puzzle_config" to "service_role";

grant references on table "public"."puzzle_config" to "service_role";

grant select on table "public"."puzzle_config" to "service_role";

grant trigger on table "public"."puzzle_config" to "service_role";

grant truncate on table "public"."puzzle_config" to "service_role";

grant update on table "public"."puzzle_config" to "service_role";
