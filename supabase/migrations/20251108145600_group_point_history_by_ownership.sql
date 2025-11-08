-- Update the get_point_history function to group consecutive ownership periods
-- This migration updates the function to consolidate consecutive ticks where the same
-- faction holds the point, showing the total time span for each continuous ownership period

CREATE OR REPLACE FUNCTION public.get_point_history(target_point_id uuid)
RETURNS TABLE (
    created_at timestamp with time zone,
    faction_id uuid,
    faction_name text,
    health smallint,
    duration_held interval
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    WITH ticks_with_change AS (
        SELECT
            pta.created_at,
            pta.acquired_by as faction_id,
            pta.health,
            LAG(pta.acquired_by) OVER (ORDER BY pta.created_at) as prev_faction_id
        FROM point_tick_archive pta
        WHERE pta.point_id = target_point_id
        ORDER BY pta.created_at
    ),
    ownership_groups AS (
        SELECT
            created_at,
            faction_id,
            health,
            -- Create a new group number whenever the faction changes
            -- Use IS DISTINCT FROM to properly handle NULL comparisons
            SUM(CASE
                WHEN prev_faction_id IS DISTINCT FROM faction_id THEN 1
                ELSE 0
            END) OVER (ORDER BY created_at) as ownership_group
        FROM ticks_with_change
    ),
    grouped_periods AS (
        SELECT
            MIN(created_at) as period_start,
            MAX(created_at) as period_end,
            (array_agg(faction_id))[1] as faction_id,
            MIN(health) as min_health,
            MAX(health) as max_health,
            ownership_group
        FROM ownership_groups
        GROUP BY ownership_group
    )
    SELECT
        gp.period_start as created_at,
        gp.faction_id,
        COALESCE(f.name, 'Unclaimed') as faction_name,
        gp.max_health as health,
        -- If this is the current ownership, calculate duration to now
        -- Otherwise, calculate duration within the grouped period
        -- Use IS NOT DISTINCT FROM to properly handle NULL (unclaimed) comparisons
        CASE
            WHEN gp.period_end = (SELECT MAX(created_at) FROM point_tick_archive WHERE point_id = target_point_id)
                AND gp.faction_id IS NOT DISTINCT FROM (SELECT acquired_by FROM point WHERE id = target_point_id)
            THEN NOW() - gp.period_start
            ELSE gp.period_end - gp.period_start + INTERVAL '5 seconds'
        END as duration_held
    FROM grouped_periods gp
    LEFT JOIN faction f ON gp.faction_id = f.id
    ORDER BY gp.period_start DESC;
$$;
