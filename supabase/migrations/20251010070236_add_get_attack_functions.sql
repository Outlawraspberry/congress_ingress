drop trigger if exists "run_on_action_was_added" on "public"."actions";

drop function if exists "public"."perform_action"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_count_of_active_users_at_point_and_faction(a_point_id uuid, a_faction_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$SELECT COUNT(*)
FROM point_user
LEFT JOIN user_game_data
ON point_user.user_id = user_game_data.user_id
WHERE point_id = a_point_id AND faction_id = a_faction_id;$function$
;

CREATE OR REPLACE FUNCTION public.get_count_of_active_users_at_point_by_user_id(a_user_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$select get_count_of_active_users_at_point_and_faction(
  (SELECT point_user.point_id from point_user where point_user.user_id = a_user_id), 
  (SELECT user_game_data.faction_id from user_game_data where user_game_data.user_id = a_user_id)
);$function$
;

CREATE OR REPLACE FUNCTION public.user_can_perform_action_on_point(point_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$begin

  return false;

end;$function$
;

CREATE OR REPLACE FUNCTION public.get_attack_damage_for_point(a_mapping_id uuid)
 RETURNS integer
 LANGUAGE sql
AS $function$select Least(
  (SELECT game.user_max_damage FROM game WHERE game.id = 1),
  (SELECT game.user_base_damage FROM game WHERE game.id = 1) + (
  (
    select get_count_of_active_users_at_point(a_mapping_id) - 1
  ) *
  (SELECT game.group_attack_multiplier_per_user FROM game WHERE game.id = 1)
)) * (select get_count_of_active_users_at_point(a_mapping_id))$function$
;

create policy "Enable insert for authenticated users only"
on "public"."actions"
as permissive
for insert
to authenticated
with check ((( SELECT puzzle.solved
   FROM puzzle
  WHERE (puzzle.id = actions.puzzle)) = true));



