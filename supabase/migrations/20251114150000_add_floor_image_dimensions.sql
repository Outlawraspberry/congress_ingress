-- Add image dimensions to floors table
-- This allows the map to display images in their original aspect ratio

ALTER TABLE public.floors
ADD COLUMN image_width INTEGER,
ADD COLUMN image_height INTEGER;

COMMENT ON COLUMN floors.image_width IS 'Width of the floor plan image in pixels';
COMMENT ON COLUMN floors.image_height IS 'Height of the floor plan image in pixels';

-- Add check constraints to ensure positive dimensions
ALTER TABLE public.floors
ADD CONSTRAINT floors_image_width_positive CHECK (image_width IS NULL OR image_width > 0);

ALTER TABLE public.floors
ADD CONSTRAINT floors_image_height_positive CHECK (image_height IS NULL OR image_height > 0);

-- Update existing floors with default dimensions (1000x1000) if they don't have dimensions
-- You should update these with actual dimensions after migration
UPDATE public.floors
SET image_width = 1000, image_height = 1000
WHERE image_width IS NULL AND image_height IS NULL;
