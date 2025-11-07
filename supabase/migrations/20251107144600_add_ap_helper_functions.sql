-- Helper functions for Action Points (AP) system

-- Function to get user's current AP
CREATE OR REPLACE FUNCTION public.get_user_current_ap(a_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_current_ap integer;
BEGIN
    SELECT action_points INTO v_current_ap
    FROM user_game_data
    WHERE user_id = a_user_id;

    -- Return 0 if user not found
    RETURN COALESCE(v_current_ap, 0);
END;
$function$;

-- Note: Removed unused helper functions get_all_ap_costs, can_user_afford_action, and get_user_ap_info
-- since we now use the user store for real-time AP tracking

-- Add RLS policies for the helper functions
-- These functions should be callable by authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_current_ap(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ap_cost_for_action(task_type) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_enough_ap(uuid, task_type) TO authenticated;
