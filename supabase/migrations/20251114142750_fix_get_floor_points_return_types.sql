-- Fix type mismatch in get_floor_points_with_discovery function
-- The function was returning INTEGER for health columns, but the actual columns are SMALLINT

CREATE OR REPLACE FUNCTION public.get_floor_points_with_discovery(p_user_id UUID, p_floor_id INTEGER)
RETURNS TABLE (
  point_id UUID,
  point_name TEXT,
  point_type public.point_type,
  point_level INTEGER,
  point_health SMALLINT,
  point_max_health SMALLINT,
  faction_id UUID,
  x_coordinate DECIMAL,
  y_coordinate DECIMAL,
  is_discovered BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS point_id,
    p.name AS point_name,
    p.type AS point_type,
    p.level AS point_level,
    p.health AS point_health,
    p.max_health AS point_max_health,
    p.acquired_by AS faction_id,
    pp.x_coordinate,
    pp.y_coordinate,
    EXISTS(
      SELECT 1 FROM public.point_discoveries pd
      WHERE pd.user_id = p_user_id AND pd.point_id = p.id
    ) AS is_discovered
  FROM public.point p
  JOIN public.point_positions pp ON p.id = pp.point_id
  WHERE pp.floor_id = p_floor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_floor_points_with_discovery(UUID, INTEGER) IS 'Returns all points on a floor with their discovery status for a user (fixed return types)';
