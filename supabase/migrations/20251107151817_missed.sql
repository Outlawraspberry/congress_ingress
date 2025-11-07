alter table "public"."actions" drop constraint "actions_puzzle_key";

drop index if exists "public"."actions_puzzle_key";

alter table "public"."actions" drop column "puzzle";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_user_afford_action(a_user_id uuid, a_action_type task_type)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_user_ap integer;
    v_required_ap smallint;
BEGIN
    -- Get user's current AP
    SELECT get_user_current_ap(a_user_id) INTO v_user_ap;

    -- Get required AP for this action
    SELECT get_ap_cost_for_action(a_action_type) INTO v_required_ap;

    -- Return true if user has enough AP
    RETURN (v_user_ap >= v_required_ap);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_ap_costs()
 RETURNS TABLE(attack_cost smallint, claim_cost smallint, repair_cost smallint, attack_and_claim_cost smallint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        attack_ap_cost,
        claim_ap_cost,
        repair_ap_cost,
        (attack_ap_cost + claim_ap_cost)::smallint as attack_and_claim_cost
    FROM game
    WHERE id = 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_ap_info(a_user_id uuid)
 RETURNS TABLE(current_ap integer, max_ap integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        get_user_current_ap(a_user_id),
        get_max_action_points();
END;
$function$
;


