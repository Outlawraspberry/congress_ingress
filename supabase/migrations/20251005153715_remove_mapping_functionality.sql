drop policy "Enable delete only for admins" on "public"."point_mapping";

drop policy "Enable insert only for admins" on "public"."point_mapping";

drop policy "Enable read only for admins" on "public"."point_mapping";

drop policy "Enable update for admins" on "public"."point_mapping";

revoke delete on table "public"."point_mapping" from "anon";

revoke insert on table "public"."point_mapping" from "anon";

revoke references on table "public"."point_mapping" from "anon";

revoke select on table "public"."point_mapping" from "anon";

revoke trigger on table "public"."point_mapping" from "anon";

revoke truncate on table "public"."point_mapping" from "anon";

revoke update on table "public"."point_mapping" from "anon";

revoke delete on table "public"."point_mapping" from "authenticated";

revoke insert on table "public"."point_mapping" from "authenticated";

revoke references on table "public"."point_mapping" from "authenticated";

revoke select on table "public"."point_mapping" from "authenticated";

revoke trigger on table "public"."point_mapping" from "authenticated";

revoke truncate on table "public"."point_mapping" from "authenticated";

revoke update on table "public"."point_mapping" from "authenticated";

revoke delete on table "public"."point_mapping" from "service_role";

revoke insert on table "public"."point_mapping" from "service_role";

revoke references on table "public"."point_mapping" from "service_role";

revoke select on table "public"."point_mapping" from "service_role";

revoke trigger on table "public"."point_mapping" from "service_role";

revoke truncate on table "public"."point_mapping" from "service_role";

revoke update on table "public"."point_mapping" from "service_role";

alter table "public"."point_mapping" drop constraint "point_mapping_point_id_fkey";

alter table "public"."point_user" drop constraint "point_user_point_id_fkey";

drop function if exists "public"."check_if_user_already_added_a_task_for_current_tick"(a_user_id uuid);

drop function if exists "public"."does_point_exists"(a_point_id uuid);

drop function if exists "public"."get_all_points_for_current_tick"();

drop function if exists "public"."get_all_users_for_current_tick"();

drop function if exists "public"."get_current_tick"();

drop function if exists "public"."get_health_of_mapping"(a_mapping_id uuid);

drop function if exists "public"."get_point_by_mapping"(a_point_id uuid);

drop function if exists "public"."perform_attack_on_mapping"(a_mapping_id uuid);

drop function if exists "public"."select_point_at_current_tick"(p_point_id uuid);

drop function if exists "public"."select_point_states_of_current_tick"();

drop function if exists "public"."select_point_states_of_tick"(a_tick bigint);

drop function if exists "public"."select_task_of_current_tick"();

alter table "public"."point_mapping" drop constraint "point-mapping_pkey";

drop index if exists "public"."point-mapping_pkey";

drop table "public"."point_mapping";

alter table "public"."point_user" add constraint "point_user_point_id_fkey" FOREIGN KEY (point_id) REFERENCES point(id) not valid;

alter table "public"."point_user" validate constraint "point_user_point_id_fkey";


