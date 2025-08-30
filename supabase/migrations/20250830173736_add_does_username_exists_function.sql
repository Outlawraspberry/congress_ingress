set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.does_username_exists(a_username text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$SELECT EXISTS (
  SELECT 1 FROM public.user WHERE public.user.name = a_username
) AS exists_bool;$function$
;
