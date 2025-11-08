-- Function to get top N users by experience for global scoreboard
CREATE OR REPLACE FUNCTION public.get_top_users_by_experience(limit_count integer DEFAULT 10)
RETURNS TABLE (
    user_id uuid,
    username text,
    experience bigint,
    faction_id uuid,
    faction_name text,
    last_action timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        ugd.user_id,
        u.name as username,
        ugd.experience,
        ugd.faction_id,
        f.name as faction_name,
        ugd.last_action
    FROM user_game_data ugd
    JOIN "user" u ON ugd.user_id = u.id
    LEFT JOIN faction f ON ugd.faction_id = f.id
    ORDER BY ugd.experience DESC
    LIMIT limit_count;
$$;

-- Function to get points overview with current ownership and historical data
CREATE OR REPLACE FUNCTION public.get_points_overview()
RETURNS TABLE (
    point_id uuid,
    point_name text,
    current_health smallint,
    max_health smallint,
    current_faction_id uuid,
    current_faction_name text,
    current_claim_duration interval,
    total_claims_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        p.id as point_id,
        p.name as point_name,
        p.health as current_health,
        p.max_health,
        p.acquired_by as current_faction_id,
        f.name as current_faction_name,
        CASE
            WHEN p.acquired_by IS NOT NULL THEN
                NOW() - (
                    SELECT MAX(pta.created_at)
                    FROM point_tick_archive pta
                    WHERE pta.point_id = p.id
                    AND pta.acquired_by = p.acquired_by
                )
            ELSE NULL
        END as current_claim_duration,
        (
            SELECT COUNT(DISTINCT pta.acquired_by)
            FROM point_tick_archive pta
            WHERE pta.point_id = p.id
            AND pta.acquired_by IS NOT NULL
        ) as total_claims_count
    FROM point p
    LEFT JOIN faction f ON p.acquired_by = f.id
    WHERE p.type = 'claimable'
    ORDER BY p.name;
$$;

-- Function to get detailed point history for a specific point
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
    WITH point_changes AS (
        SELECT
            pta.created_at,
            pta.acquired_by as faction_id,
            pta.health,
            LEAD(pta.created_at) OVER (ORDER BY pta.created_at) as next_change
        FROM point_tick_archive pta
        WHERE pta.point_id = target_point_id
        ORDER BY pta.created_at
    )
    SELECT
        pc.created_at,
        pc.faction_id,
        COALESCE(f.name, 'Unclaimed') as faction_name,
        pc.health,
        COALESCE(pc.next_change - pc.created_at, NOW() - pc.created_at) as duration_held
    FROM point_changes pc
    LEFT JOIN faction f ON pc.faction_id = f.id
    ORDER BY pc.created_at DESC;
$$;

-- Function to get faction statistics
CREATE OR REPLACE FUNCTION public.get_faction_statistics()
RETURNS TABLE (
    faction_id uuid,
    faction_name text,
    total_members bigint,
    total_experience bigint,
    average_experience numeric,
    points_controlled bigint,
    total_historical_claims bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        f.id as faction_id,
        f.name as faction_name,
        COUNT(DISTINCT ugd.user_id) as total_members,
        COALESCE(SUM(ugd.experience), 0) as total_experience,
        COALESCE(AVG(ugd.experience), 0) as average_experience,
        (
            SELECT COUNT(*)
            FROM point p
            WHERE p.acquired_by = f.id
        ) as points_controlled,
        (
            SELECT COUNT(*)
            FROM point_tick_archive pta
            WHERE pta.acquired_by = f.id
        ) as total_historical_claims
    FROM faction f
    LEFT JOIN user_game_data ugd ON f.id = ugd.faction_id
    GROUP BY f.id, f.name
    ORDER BY total_experience DESC;
$$;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION public.get_top_users_by_experience(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_points_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_point_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_faction_statistics() TO authenticated;
