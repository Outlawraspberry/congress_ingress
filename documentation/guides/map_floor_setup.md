# Floor Plan Setup Guide - Image Dimensions & Coordinates

## Overview

This guide explains how to set up floor plans with their correct image dimensions to ensure proper display and accurate point positioning on the map.

## Why Image Dimensions Matter

The map system uses the actual dimensions of your floor plan images to:
- Display images in their original aspect ratio (not stretched or squashed)
- Ensure point coordinates align correctly with visual features
- Maintain consistent scaling across different floor plans

## Quick Start

### 1. Get Your Image Dimensions

Before uploading a floor plan, you need to know its dimensions in pixels.

**Using Command Line:**
```bash
# On Linux/Mac
identify -format "%wx%h" your-floor-plan.png

# On Mac (alternative)
sips -g pixelWidth -g pixelHeight your-floor-plan.png

# On Windows (PowerShell)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\path\to\your-floor-plan.png")
Write-Host "$($img.Width)x$($img.Height)"
$img.Dispose()
```

**Using Image Editor:**
- Open the image in any image editor (GIMP, Photoshop, Paint.NET, etc.)
- Check image properties or document size
- Note the width and height in pixels

**Using Online Tool:**
- Upload to https://www.img2go.com/image-size or similar
- Read dimensions from the result

### 2. Upload Floor Plan Image

Upload your floor plan image to your storage solution (Supabase Storage, S3, etc.) and get the public URL.

### 3. Create Floor Record

Insert the floor into the database with its dimensions:

```sql
INSERT INTO public.floors (
  name,
  building_name,
  map_image_url,
  image_width,
  image_height,
  display_order
)
VALUES (
  'Ground Floor',
  'Main Building',
  'https://your-storage.com/floor-plans/ground-floor.png',
  1920,  -- Replace with your image width
  1080,  -- Replace with your image height
  1
);
```

### 4. Update Existing Floor Dimensions

If you already have floors without dimensions, update them:

```sql
-- Using the helper function
SELECT update_floor_image_dimensions(1, 1920, 1080);

-- Or update directly
UPDATE public.floors
SET
  image_width = 1920,
  image_height = 1080,
  updated_at = now()
WHERE id = 1;
```

## Coordinate System

### Understanding Coordinates

The map uses a simple coordinate system:
- **Origin (0,0)**: Top-left corner of the image
- **X-axis**: Increases to the right (width)
- **Y-axis**: Increases downward (height)
- **Maximum**: (image_width, image_height) at bottom-right corner

### Example

For a 1920x1080 image:
```
(0, 0) ─────────────────────────► (1920, 0)
  │                                    │
  │        Your Floor Plan             │
  │                                    │
  │                                    │
  ▼                                    ▼
(0, 1080) ──────────────────────► (1920, 1080)
```

### Placing Points

When placing points on your floor plan:

1. **Use the same coordinate system** as your image
2. Coordinates should be in pixels
3. Point at position (960, 540) will appear at the center of a 1920x1080 image

## Working with Different Aspect Ratios

### Portrait Images (taller than wide)
```sql
-- Example: 1080x1920 (vertical)
INSERT INTO public.floors (name, map_image_url, image_width, image_height)
VALUES ('Stairwell Floor', 'https://...', 1080, 1920);
```

### Landscape Images (wider than tall)
```sql
-- Example: 2560x1440 (widescreen)
INSERT INTO public.floors (name, map_image_url, image_width, image_height)
VALUES ('Cafeteria Floor', 'https://...', 2560, 1440);
```

### Square Images
```sql
-- Example: 2048x2048
INSERT INTO public.floors (name, map_image_url, image_width, image_height)
VALUES ('Conference Floor', 'https://...', 2048, 2048);
```

## Adding Points to Floor Plans

### Method 1: Using Image Editor

1. Open your floor plan in an image editor
2. Enable ruler/grid and pixel coordinates
3. Click where you want to place a point
4. Note the X,Y coordinates
5. Insert the point:

```sql
INSERT INTO public.point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES ('point-uuid-here', 1, 750.5, 320.8);
```

### Method 2: Using Drawing Tool

1. Use a tool like Figma, Photoshop, or GIMP
2. Import your floor plan as a background
3. Place markers at desired locations
4. Export coordinates or read them from the tool
5. Insert into database

### Method 3: Using Percentage Conversion

If you have percentages:
```javascript
// Convert percentage to pixel coordinates
const imageWidth = 1920;
const imageHeight = 1080;
const percentX = 45.5; // 45.5% from left
const percentY = 62.3; // 62.3% from top

const x = (percentX / 100) * imageWidth;  // = 873.6
const y = (percentY / 100) * imageHeight; // = 672.84
```

## Helper Functions

### Get Floor Coordinate Info

Check the coordinate system for a floor:

```sql
SELECT * FROM get_floor_coordinate_info(1);
```

Returns:
```
floor_id | floor_name    | image_width | image_height | coordinate_info
---------|---------------|-------------|--------------|------------------
1        | Ground Floor  | 1920        | 1080         | Point coordinates should range from (0,0) to (1920,1080)...
```

### Update Floor Dimensions

```sql
-- Update dimensions for floor with ID 1
SELECT update_floor_image_dimensions(1, 1920, 1080);
-- Returns: true (on success)
```

### Batch Update Multiple Floors

```sql
-- Update multiple floors at once
DO $$
BEGIN
  PERFORM update_floor_image_dimensions(1, 1920, 1080);
  PERFORM update_floor_image_dimensions(2, 2560, 1440);
  PERFORM update_floor_image_dimensions(3, 1080, 1920);
END $$;
```

## Common Image Sizes

### Standard Resolutions
- **HD**: 1280 x 720
- **Full HD**: 1920 x 1080
- **2K**: 2560 x 1440
- **4K**: 3840 x 2160
- **A4 at 150 DPI**: 1240 x 1754
- **A4 at 300 DPI**: 2480 x 3508

### Recommended Image Sizes

For best performance and quality:
- **Minimum**: 1280px on the shortest side
- **Recommended**: 1920px on the shortest side
- **Maximum**: 4096px on the longest side

### File Size Considerations

- Keep file sizes under 5MB for good mobile performance
- Use PNG for floor plans with text/sharp lines
- Use JPEG (quality 85-90) for photographic floor plans
- Consider WebP for best compression with quality

## Troubleshooting

### Points Don't Align with Floor Plan

**Problem**: Points appear in wrong locations on the map.

**Solution**:
1. Verify image dimensions are correct
2. Check that point coordinates match the image coordinate system
3. Ensure you're using (x, y) not (y, x)

```sql
-- Check current dimensions
SELECT id, name, image_width, image_height FROM floors;

-- Verify point coordinates
SELECT pp.point_id, pp.x_coordinate, pp.y_coordinate, f.image_width, f.image_height
FROM point_positions pp
JOIN floors f ON pp.floor_id = f.id
WHERE pp.floor_id = 1;
```

### Image Appears Stretched

**Problem**: Floor plan image looks distorted.

**Solution**:
1. Check if image dimensions in database match actual image
2. Update with correct dimensions:

```sql
SELECT update_floor_image_dimensions(1, 1920, 1080);
```

### Image Doesn't Fill Map

**Problem**: Map shows white space around the image.

**Solution**: This is normal if your image has a different aspect ratio than the viewport. The map automatically fits the entire image while maintaining aspect ratio.

### Points Outside Visible Area

**Problem**: Some points don't appear on the map.

**Solution**: Points may have coordinates outside the image bounds.

```sql
-- Find points outside bounds
SELECT
  pp.point_id,
  p.name,
  pp.x_coordinate,
  pp.y_coordinate,
  f.image_width,
  f.image_height
FROM point_positions pp
JOIN floors f ON pp.floor_id = f.id
JOIN point p ON pp.point_id = p.id
WHERE pp.floor_id = 1
  AND (
    pp.x_coordinate < 0
    OR pp.x_coordinate > f.image_width
    OR pp.y_coordinate < 0
    OR pp.y_coordinate > f.image_height
  );
```

## Best Practices

### Image Preparation

1. **Clean Images**: Remove unnecessary details, watermarks
2. **Clear Labels**: Ensure room numbers/names are readable
3. **Consistent Style**: Use same design style for all floors
4. **Orientation**: Keep consistent orientation across floors
5. **Scale**: Include a scale indicator if possible

### Database Management

1. **Always Set Dimensions**: Never leave `image_width` or `image_height` as NULL
2. **Update When Changing Images**: If you replace a floor plan image, update dimensions
3. **Document Changes**: Add comments when updating dimensions
4. **Backup**: Keep original high-resolution images backed up

### Point Placement

1. **Logical Locations**: Place points at meaningful locations (doors, rooms, landmarks)
2. **Accessibility**: Ensure points are reachable by players
3. **Spacing**: Space points at least 50-100 pixels apart for mobile usability
4. **Consistency**: Use consistent placement logic across floors

## Example Workflow

### Complete Setup for a New Floor

```sql
-- 1. Insert floor (assuming image is 1920x1080)
INSERT INTO public.floors (
  name,
  building_name,
  map_image_url,
  image_width,
  image_height,
  display_order,
  is_active
)
VALUES (
  '2nd Floor',
  'Science Building',
  'https://storage.example.com/floors/science-2nd.png',
  1920,
  1080,
  2,
  true
)
RETURNING id;
-- Returns: 5

-- 2. Verify floor info
SELECT * FROM get_floor_coordinate_info(5);

-- 3. Add points (using coordinates from image editor)
INSERT INTO public.point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES
  ((SELECT id FROM point WHERE name = 'Lab 201'), 5, 450.0, 300.0),
  ((SELECT id FROM point WHERE name = 'Lab 202'), 5, 850.0, 300.0),
  ((SELECT id FROM point WHERE name = 'Classroom 203'), 5, 1400.0, 500.0);

-- 4. Verify points are within bounds
SELECT
  p.name,
  pp.x_coordinate,
  pp.y_coordinate,
  CASE
    WHEN pp.x_coordinate BETWEEN 0 AND f.image_width
      AND pp.y_coordinate BETWEEN 0 AND f.image_height
    THEN 'OK'
    ELSE 'OUT OF BOUNDS'
  END as status
FROM point_positions pp
JOIN point p ON pp.point_id = p.id
JOIN floors f ON pp.floor_id = f.id
WHERE pp.floor_id = 5;
```

## Migration from Old System

If you have existing floors without dimensions:

```sql
-- 1. List floors missing dimensions
SELECT id, name, map_image_url
FROM floors
WHERE image_width IS NULL OR image_height IS NULL;

-- 2. Update each floor with correct dimensions
-- (Get dimensions from your images first)
SELECT update_floor_image_dimensions(1, 1920, 1080);
SELECT update_floor_image_dimensions(2, 2560, 1440);
-- ... etc

-- 3. Verify all floors have dimensions
SELECT
  id,
  name,
  image_width,
  image_height,
  CASE
    WHEN image_width IS NULL OR image_height IS NULL
    THEN 'MISSING'
    ELSE 'OK'
  END as status
FROM floors;
```

## Advanced: Programmatic Point Placement

### JavaScript/TypeScript Helper

```typescript
interface FloorDimensions {
  width: number;
  height: number;
}

interface Point {
  id: string;
  x: number;
  y: number;
}

// Place points in a grid pattern
function generateGridPoints(
  floor: FloorDimensions,
  rows: number,
  cols: number,
  margin: number = 100
): Point[] {
  const points: Point[] = [];
  const usableWidth = floor.width - (2 * margin);
  const usableHeight = floor.height - (2 * margin);
  const xSpacing = usableWidth / (cols - 1);
  const ySpacing = usableHeight / (rows - 1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      points.push({
        id: `point-${row}-${col}`,
        x: margin + (col * xSpacing),
        y: margin + (row * ySpacing)
      });
    }
  }

  return points;
}

// Usage
const floor = { width: 1920, height: 1080 };
const points = generateGridPoints(floor, 3, 5, 100);
// Creates 15 points in a 3x5 grid with 100px margin
```

## Support

For issues or questions:
1. Check that image dimensions in database match actual image files
2. Verify point coordinates are within image bounds
3. Ensure images are accessible at the provided URLs
4. Test on different screen sizes and devices

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0