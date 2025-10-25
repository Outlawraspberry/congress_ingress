alter table "public"."game" add column "group_attack_multiplier_per_user" smallint not null default '1'::smallint;

alter table "public"."game" add column "group_repair_multiplier_per_user" smallint not null default '2'::smallint;

alter table "public"."game" add column "user_base_damage" smallint not null default '10'::smallint;

alter table "public"."game" add column "user_base_repair" smallint not null default '10'::smallint;

alter table "public"."game" add column "user_max_damage" smallint not null default '200'::smallint;

alter table "public"."game" add constraint "game_check" CHECK (((user_max_damage > 0) AND (user_max_damage >= user_base_damage))) not valid;

alter table "public"."game" validate constraint "game_check";

alter table "public"."game" add constraint "game_group_attack_multiplier_per_user_check" CHECK ((group_attack_multiplier_per_user > 0)) not valid;

alter table "public"."game" validate constraint "game_group_attack_multiplier_per_user_check";

alter table "public"."game" add constraint "game_group_repair_multiplier_per_user_check" CHECK ((group_repair_multiplier_per_user > 0)) not valid;

alter table "public"."game" validate constraint "game_group_repair_multiplier_per_user_check";

alter table "public"."game" add constraint "game_user_base_damage_check" CHECK ((user_base_damage > 0)) not valid;

alter table "public"."game" validate constraint "game_user_base_damage_check";

alter table "public"."game" add constraint "game_user_base_repair_check" CHECK ((user_base_repair > 0)) not valid;

alter table "public"."game" validate constraint "game_user_base_repair_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_attack_damage_for_point(a_mapping_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$select Least(
  (SELECT game.user_max_damage FROM game WHERE game.id = 1),
  (SELECT game.user_base_damage FROM game WHERE game.id = 1) + (
  (
    select get_count_of_active_users_at_point('f2173573-eab5-4155-a655-40e9dc7d1d0e') - 1
  ) *
  (SELECT game.group_attack_multiplier_per_user FROM game WHERE game.id = 1)
))$function$
;

CREATE OR REPLACE FUNCTION public.get_count_of_active_users_at_point(a_mapping_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$SELECT COUNT(*)
FROM point_user
WHERE point_user.point_id = a_mapping_id$function$
;

CREATE OR REPLACE FUNCTION public.get_health_of_mapping(a_mapping_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$SELECT point.health
FROM point
LEFT JOIN point_mapping
ON point.id = point_mapping.point_id
WHERE point_mapping.id = a_mapping_id;$function$
;

CREATE OR REPLACE FUNCTION public.perform_attack_on_mapping(a_mapping_id uuid)
 RETURNS void
 LANGUAGE sql
AS $function$UPDATE point
SET health = (
  (select point.health from point where point.id = (
    select point_mapping.point_id from point_mapping where id = 'f2173573-eab5-4155-a655-40e9dc7d1d0e')
  ) -
  (select get_attack_damage_for_point('f2173573-eab5-4155-a655-40e9dc7d1d0e'))
)
WHERE point.id = (select point_mapping.point_id from point_mapping where id = 'f2173573-eab5-4155-a655-40e9dc7d1d0e')$function$
;


