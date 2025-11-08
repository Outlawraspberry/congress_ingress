-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Update the create_point_archive_snapshot function to check game state
CREATE OR REPLACE FUNCTION public.create_point_archive_snapshot()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only create snapshot if game with id=1 is in 'playing' state
  IF EXISTS (SELECT 1 FROM public.game WHERE id = 1 AND state = 'playing') THEN
    INSERT INTO point_tick_archive (point_id, health, acquired_by)
    SELECT id, health, acquired_by
    FROM point;
  END IF;
END;
$function$;

-- Schedule the create_point_archive_snapshot function to run every 5 seconds
SELECT cron.schedule(
    'point-archive-snapshot-5s',
    '5 seconds',
    $$SELECT create_point_archive_snapshot()$$
);
