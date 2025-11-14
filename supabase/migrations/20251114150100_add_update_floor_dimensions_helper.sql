-- Helper function to update floor image dimensions
-- This function allows admins to easily update image dimensions for floor plans

CREATE OR REPLACE FUNCTION public.update_floor_image_dimensions(
  p_floor_id INTEGER,
  p_width INTEGER,
  p_height INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inputs
  IF p_width <= 0 OR p_height <= 0 THEN
    RAISE EXCEPTION 'Image dimensions must be positive integers';
  END IF;

  -- Update floor dimensions
  UPDATE public.floors
  SET
    image_width = p_width,
    image_height = p_height,
    updated_at = now()
  WHERE id = p_floor_id;

  -- Check if floor exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Floor with id % not found', p_floor_id;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.update_floor_image_dimensions(INTEGER, INTEGER, INTEGER) IS
'Updates the image dimensions for a floor plan. Used when uploading new floor images.';

-- Helper function to get recommended coordinate scale
-- This helps convert pixel coordinates to map coordinates
CREATE OR REPLACE FUNCTION public.get_floor_coordinate_info(p_floor_id INTEGER)
RETURNS TABLE (
  floor_id INTEGER,
  floor_name TEXT,
  image_width INTEGER,
  image_height INTEGER,
  coordinate_info TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.image_width,
    f.image_height,
    CASE
      WHEN f.image_width IS NULL OR f.image_height IS NULL THEN
        'Image dimensions not set. Please update using update_floor_image_dimensions().'
      ELSE
        format('Point coordinates should range from (0,0) to (%s,%s). ' ||
               'If placing points on an image editor, use the same coordinate system.',
               f.image_width, f.image_height)
    END as coordinate_info
  FROM public.floors f
  WHERE f.id = p_floor_id;
END;
$$;

COMMENT ON FUNCTION public.get_floor_coordinate_info(INTEGER) IS
'Returns coordinate system information for a floor, helping admins place points correctly.';

-- Example usage:
--
-- Update floor dimensions after uploading a 1920x1080 image:
-- SELECT update_floor_image_dimensions(1, 1920, 1080);
--
-- Get coordinate info for a floor:
-- SELECT * FROM get_floor_coordinate_info(1);
