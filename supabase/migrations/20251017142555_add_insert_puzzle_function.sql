set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_timeout_for_puzzle(a_type "puzzle-type")
 RETURNS smallint
 LANGUAGE sql
AS $function$
  SELECT puzzle_config.timeout FROM puzzle_config WHERE puzzle_config.type = a_type
$function$
;

CREATE OR REPLACE FUNCTION public.insert_puzzle(a_user_id uuid, a_task jsonb, a_type "puzzle-type")
 RETURNS puzzle
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_puzzle puzzle;
BEGIN
    INSERT INTO public.puzzle (user_id, task, type, expires_at)
    VALUES (
      a_user_id,
      a_task,
      a_type,
      (NOW() + ((select get_timeout_for_puzzle(a_type)) || ' seconds')::interval)
    )
    RETURNING * INTO v_puzzle;

    RETURN v_puzzle;
END;
$function$
;



create policy "Enable read access for all authenticated users"
on "public"."puzzle_config"
as permissive
for select
to authenticated
using (true);
