CREATE OR REPLACE FUNCTION public.get_max_action_points()
 RETURNS int4
 LANGUAGE plpgsql
AS $function$begin
    return SELECT max_ap FROM game WHERE game.id = 1;
end;$function$
;

CREATE OR REPLACE FUNCTION public.gain_ap_on_puzzle_solve()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  --- type
  IF (new.solved = TRUE) THEN
    UPDATE user_game_data
    SET action_points = (select LEAST(
        (select get_max_action_points()),
        action_points + (select get_ap_gain_for_puzzle_type(new.type))
    ))
    WHERE user_id = new.user_id;
  END IF;

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_ap_gain_for_puzzle_type(a_puzzle_type "puzzle-type")
 RETURNS integer
 LANGUAGE plpgsql
AS $function$begin
  return (
    select ap_gain
    from puzzle_config
    where puzzle_config.type = a_puzzle_type
  );
end;$function$
;
