drop function if exists "public"."user_can_perform_action_on_point"(point_id uuid);

alter table "public"."game" add column "user_last_action_timeout_in_seconds" smallint not null default '10'::smallint;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_user_perform_action_on_point(a_user_id uuid, a_poind_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_last_action TIMESTAMP;
    v_timeout_seconds INTEGER;
    v_exceeded BOOLEAN;
BEGIN
    -- Get last_action for the user
    SELECT last_action INTO v_last_action
    FROM public.user_game_data
    WHERE user_id = a_user_id;

    -- Get timeout value from game table
    SELECT user_last_action_timeout_in_seconds INTO v_timeout_seconds
    FROM game
    WHERE id = 1;

    -- Check if last_action is older than timeout
    v_exceeded := (EXTRACT(EPOCH FROM (NOW() - v_last_action)) > v_timeout_seconds);

    IF v_exceeded = false THEN
            RAISE EXCEPTION 'Timeout exceeded for user % in game %', a_user_id, a_poind_id;
    END IF;

    RETURN v_exceeded;
END
$function$
;
