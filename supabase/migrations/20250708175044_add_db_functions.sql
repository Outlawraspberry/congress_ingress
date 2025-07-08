
create or replace function game.check_if_user_already_added_a_task_for_current_tick(a_user_id uuid)
returns bool
language sql
as $$
SELECT EXISTS (
  SELECT 1 FROM game.tick_task WHERE created_by=a_user_id AND tick=(SELECT tick from game.game)
);
$$;

create or replace function game.does_point_exists(a_point_id uuid)
returns bool
language sql
as $$
SELECT EXISTS (
  SELECT 1 FROM game.point WHERE id = a_point_id
) AS exists_bool;
$$;

create or replace function game.select_point_states_of_tick(a_tick bigint)
returns record
language sql
as $$
SELECT * FROM game.tick_point WHERE tick=a_tick
$$;

create or replace function game.select_point_states_of_current_tick()
returns record
language sql
as $$
SELECT * FROM game.tick_point WHERE tick=(SELECT tick from game.game)
$$;
