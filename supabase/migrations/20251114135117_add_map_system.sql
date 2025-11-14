-- =====================================================
-- Map System Migration
-- =====================================================
-- Creates tables and functions for the game map system:
-- - floors: Configurable floor plans with image URLs
-- - point_positions: Spatial positioning of points on floors
-- - point_discoveries: Track which users have discovered which points
-- =====================================================

-- =====================================================
-- 1. FLOORS TABLE
-- =====================================================
-- Stores floor plan configuration with image URLs
CREATE TABLE IF NOT EXISTS public.floors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  building_name TEXT,
  map_image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for ordering floors
CREATE INDEX idx_floors_display_order ON public.floors(display_order);

-- Comment on table
COMMENT ON TABLE public.floors IS 'Floor plan configuration with image URLs for the game map';

-- =====================================================
-- 2. POINT POSITIONS TABLE
-- =====================================================
-- Stores the spatial position of each point on a floor
CREATE TABLE IF NOT EXISTS public.point_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL REFERENCES public.point(id) ON DELETE CASCADE,
  floor_id INTEGER NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  x_coordinate DECIMAL(10, 2) NOT NULL,
  y_coordinate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(point_id)
);

-- Indexes for efficient querying
CREATE INDEX idx_point_positions_floor ON public.point_positions(floor_id);
CREATE INDEX idx_point_positions_point ON public.point_positions(point_id);

-- Comment on table
COMMENT ON TABLE public.point_positions IS 'Spatial positioning of points on floor maps';
COMMENT ON COLUMN public.point_positions.x_coordinate IS 'X coordinate on the floor plan (in pixels or relative units)';
COMMENT ON COLUMN public.point_positions.y_coordinate IS 'Y coordinate on the floor plan (in pixels or relative units)';

-- =====================================================
-- 3. POINT DISCOVERIES TABLE
-- =====================================================
-- Tracks which users have discovered (visited) which points
CREATE TABLE IF NOT EXISTS public.point_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  point_id UUID NOT NULL REFERENCES public.point(id) ON DELETE CASCADE,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, point_id)
);

-- Indexes for efficient querying
CREATE INDEX idx_point_discoveries_user ON public.point_discoveries(user_id);
CREATE INDEX idx_point_discoveries_point ON public.point_discoveries(point_id);

-- Comment on table
COMMENT ON TABLE public.point_discoveries IS 'Tracks which users have discovered which points for fog-of-war system';

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function: Mark a point as discovered by a user
CREATE OR REPLACE FUNCTION public.mark_point_discovered()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert discovery record, ignore if already exists
  INSERT INTO public.point_discoveries (user_id, point_id)
  VALUES (NEW.user_id, NEW.point_id)
  ON CONFLICT (user_id, point_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.mark_point_discovered() IS 'Automatically marks a point as discovered when a user scans its QR code';

-- Function: Get all discovered points for a user
CREATE OR REPLACE FUNCTION public.get_user_discoveries(p_user_id UUID)
RETURNS TABLE (
  point_id UUID,
  discovered_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT pd.point_id, pd.discovered_at
  FROM public.point_discoveries pd
  WHERE pd.user_id = p_user_id
  ORDER BY pd.discovered_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_discoveries(UUID) IS 'Returns all points discovered by a specific user';

-- Function: Check if user has discovered a point
CREATE OR REPLACE FUNCTION public.has_user_discovered_point(p_user_id UUID, p_point_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.point_discoveries
    WHERE user_id = p_user_id AND point_id = p_point_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_user_discovered_point(UUID, UUID) IS 'Checks if a user has discovered a specific point';

-- Function: Get points on a specific floor with discovery status
CREATE OR REPLACE FUNCTION public.get_floor_points_with_discovery(p_user_id UUID, p_floor_id INTEGER)
RETURNS TABLE (
  point_id UUID,
  point_name TEXT,
  point_type public.point_type,
  point_level INTEGER,
  point_health INTEGER,
  point_max_health INTEGER,
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

COMMENT ON FUNCTION public.get_floor_points_with_discovery(UUID, INTEGER) IS 'Returns all points on a floor with their discovery status for a user';

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger: Auto-discover points when user scans QR code (visits point)
DROP TRIGGER IF EXISTS trigger_mark_point_discovered ON public.point_user;
CREATE TRIGGER trigger_mark_point_discovered
  AFTER INSERT ON public.point_user
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_point_discovered();

COMMENT ON TRIGGER trigger_mark_point_discovered ON public.point_user IS 'Marks point as discovered when user visits it';

-- Trigger: Update updated_at timestamp on floors
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_floors_timestamp ON public.floors;
CREATE TRIGGER trigger_update_floors_timestamp
  BEFORE UPDATE ON public.floors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_point_positions_timestamp ON public.point_positions;
CREATE TRIGGER trigger_update_point_positions_timestamp
  BEFORE UPDATE ON public.point_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_discoveries ENABLE ROW LEVEL SECURITY;

-- Floors: Everyone can read (public information)
CREATE POLICY "Floors are viewable by everyone"
  ON public.floors
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Floors: Only admins can insert/update/delete
CREATE POLICY "Only admins can manage floors"
  ON public.floors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_role
      WHERE user_role.user_id = auth.uid()
      AND user_role.role = 'admin'
    )
  );

-- Point Positions: Everyone can read (public information)
CREATE POLICY "Point positions are viewable by everyone"
  ON public.point_positions
  FOR SELECT
  TO authenticated
  USING (true);

-- Point Positions: Only admins can insert/update/delete
CREATE POLICY "Only admins can manage point positions"
  ON public.point_positions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_role
      WHERE user_role.user_id = auth.uid()
      AND user_role.role = 'admin'
    )
  );

-- Point Discoveries: Users can only see their own discoveries
CREATE POLICY "Users can view their own discoveries"
  ON public.point_discoveries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Point Discoveries: Users can only insert their own discoveries
CREATE POLICY "Users can mark their own discoveries"
  ON public.point_discoveries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Point Discoveries: Users cannot delete or update discoveries
-- (Discoveries are permanent once made)

-- =====================================================
-- 7. ENABLE REALTIME
-- =====================================================

-- Enable realtime for point_positions (for admin updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.point_positions;

-- Enable realtime for point_discoveries (for discovery notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.point_discoveries;

-- Enable realtime for floors (for configuration changes)
ALTER PUBLICATION supabase_realtime ADD TABLE public.floors;

-- =====================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample floors (commented out - enable if needed for testing)
-- INSERT INTO public.floors (name, building_name, map_image_url, display_order) VALUES
--   ('Ground Floor', 'Main Building', '/floor-plans/ground-floor.svg', 1),
--   ('First Floor', 'Main Building', '/floor-plans/first-floor.svg', 2),
--   ('Second Floor', 'Main Building', '/floor-plans/second-floor.svg', 3);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
