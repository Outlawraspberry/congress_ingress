# Image Dimensions Support - Implementation Summary

## Overview

The map system now supports floor plan images with any aspect ratio. Images are displayed in their original dimensions without stretching or distortion, and point coordinates align correctly with the actual image pixels.

## What Changed

### 1. Database Schema Updates

**New Columns Added to `floors` Table:**
- `image_width` (INTEGER) - Width of the floor plan image in pixels
- `image_height` (INTEGER) - Height of the floor plan image in pixels

**Migration Files:**
- `20251114150000_add_floor_image_dimensions.sql` - Adds columns and constraints
- `20251114150100_add_update_floor_dimensions_helper.sql` - Adds helper functions

### 2. Helper Functions

**`update_floor_image_dimensions(floor_id, width, height)`**
- Updates image dimensions for a specific floor
- Validates that dimensions are positive integers
- Returns `true` on success

**`get_floor_coordinate_info(floor_id)`**
- Returns coordinate system information for a floor
- Helps administrators understand the coordinate range
- Provides guidance for point placement

### 3. MapView Component Updates

**Before:**
- Used fixed 1000x1000 bounds for all floors
- Images were stretched to fit square viewport

**After:**
- Dynamically calculates bounds from `image_width` and `image_height`
- Falls back to 1000x1000 if dimensions not set
- Maintains original aspect ratio
- Properly scales point coordinates

## Coordinate System

### How It Works

```
(0, 0) ────────────────────────► (width, 0)
  │                                    │
  │        Floor Plan Image            │
  │                                    │
  │                                    │
  ▼                                    ▼
(0, height) ────────────────────► (width, height)
```

- **Origin**: Top-left corner (0, 0)
- **X-axis**: Increases to the right (horizontal)
- **Y-axis**: Increases downward (vertical)
- **Range**: X from 0 to `image_width`, Y from 0 to `image_height`

### Example

For a 1920x1080 floor plan image:
- Point at center: `(960, 540)`
- Point at top-right corner: `(1920, 0)`
- Point at bottom-left: `(0, 1080)`

## Usage Guide

### For New Floors

When adding a new floor, include the image dimensions:

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
  'https://your-storage.com/floor-plan.png',
  1920,  -- Your image width in pixels
  1080,  -- Your image height in pixels
  1
);
```

### For Existing Floors

Update existing floors with their correct dimensions:

```sql
-- Using the helper function (recommended)
SELECT update_floor_image_dimensions(1, 1920, 1080);

-- Or update directly
UPDATE public.floors
SET image_width = 1920, image_height = 1080
WHERE id = 1;
```

### Getting Image Dimensions

**Command Line (Linux/Mac):**
```bash
identify -format "%wx%h" your-floor-plan.png
# Output: 1920x1080
```

**Command Line (Mac alternative):**
```bash
sips -g pixelWidth -g pixelHeight your-floor-plan.png
```

**PowerShell (Windows):**
```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\path\to\image.png")
Write-Host "$($img.Width)x$($img.Height)"
$img.Dispose()
```

**Image Editor:**
- Open in any image editor
- Check Image Properties or Document Size
- Note width x height in pixels

## Examples

### Landscape Image (Widescreen)
```sql
-- 2560x1440 floor plan
INSERT INTO floors (name, map_image_url, image_width, image_height)
VALUES ('Cafeteria', 'https://...', 2560, 1440);
```

### Portrait Image (Vertical)
```sql
-- 1080x1920 floor plan (taller than wide)
INSERT INTO floors (name, map_image_url, image_width, image_height)
VALUES ('Stairwell', 'https://...', 1080, 1920);
```

### Square Image
```sql
-- 2048x2048 floor plan
INSERT INTO floors (name, map_image_url, image_width, image_height)
VALUES ('Conference Hall', 'https://...', 2048, 2048);
```

## Point Placement

### Method 1: Using Image Editor

1. Open floor plan in image editor (GIMP, Photoshop, etc.)
2. Enable pixel coordinates/ruler
3. Click location where you want to place a point
4. Note the X,Y coordinates
5. Insert into database:

```sql
INSERT INTO point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES ('point-uuid', 1, 750.5, 320.8);
```

### Method 2: Percentage Conversion

If you have percentages:
```javascript
const imageWidth = 1920;
const imageHeight = 1080;
const percentX = 45.5; // 45.5% from left
const percentY = 62.3; // 62.3% from top

const x = (percentX / 100) * imageWidth;  // = 873.6
const y = (percentY / 100) * imageHeight; // = 672.84
```

## Verification

### Check Floor Dimensions
```sql
SELECT id, name, image_width, image_height
FROM floors;
```

### Verify Points Are Within Bounds
```sql
SELECT
  p.name,
  pp.x_coordinate,
  pp.y_coordinate,
  f.image_width,
  f.image_height,
  CASE
    WHEN pp.x_coordinate BETWEEN 0 AND f.image_width
      AND pp.y_coordinate BETWEEN 0 AND f.image_height
    THEN '✓ OK'
    ELSE '✗ OUT OF BOUNDS'
  END as status
FROM point_positions pp
JOIN point p ON pp.point_id = p.id
JOIN floors f ON pp.floor_id = f.id
WHERE pp.floor_id = 1;
```

### Get Coordinate Info
```sql
SELECT * FROM get_floor_coordinate_info(1);
```

## Migration from Old System

If you have existing floors without dimensions:

```sql
-- 1. Find floors missing dimensions
SELECT id, name, map_image_url
FROM floors
WHERE image_width IS NULL OR image_height IS NULL;

-- 2. Get actual dimensions of your images (using command line tools)

-- 3. Update each floor
SELECT update_floor_image_dimensions(1, 1920, 1080);
SELECT update_floor_image_dimensions(2, 2560, 1440);
-- etc.

-- 4. Verify all updated
SELECT
  id,
  name,
  COALESCE(image_width::text, 'MISSING') as width,
  COALESCE(image_height::text, 'MISSING') as height
FROM floors;
```

## Troubleshooting

### Points Don't Align with Floor Plan

**Cause**: Incorrect image dimensions in database

**Fix**:
1. Get actual image dimensions
2. Update floor: `SELECT update_floor_image_dimensions(floor_id, width, height);`
3. Refresh map

### Image Appears Stretched

**Cause**: Image dimensions don't match actual image file

**Fix**: Update with correct dimensions from the actual image file

### Points Outside Visible Area

**Cause**: Point coordinates exceed image dimensions

**Fix**: Check and update point coordinates:
```sql
-- Find problematic points
SELECT pp.point_id, p.name, pp.x_coordinate, pp.y_coordinate
FROM point_positions pp
JOIN point p ON pp.point_id = p.id
JOIN floors f ON pp.floor_id = f.id
WHERE pp.floor_id = 1
  AND (pp.x_coordinate < 0 OR pp.x_coordinate > f.image_width
    OR pp.y_coordinate < 0 OR pp.y_coordinate > f.image_height);
```

## Best Practices

1. **Always Set Dimensions**: Never leave `image_width` or `image_height` as NULL
2. **Verify Dimensions**: Double-check dimensions match your actual image files
3. **Use Original Images**: Get dimensions from the actual image file you're using
4. **Document Changes**: Keep notes when updating floor plans
5. **Test After Updates**: Check the map displays correctly after dimension changes
6. **Backup**: Keep original images backed up

## Technical Details

### Default Behavior

If `image_width` or `image_height` is NULL:
- System falls back to 1000x1000
- Image may appear stretched or compressed
- Point alignment may be incorrect

### Coordinate Precision

- Coordinates support decimal places (e.g., 750.5, 320.8)
- Use decimals for precise placement
- Database stores as DECIMAL type

### Performance

- Image dimensions are cached by the client
- No performance impact from different aspect ratios
- Large images (>4096px) may load slower on mobile

## Files Changed

### Database Migrations
- `supabase/migrations/20251114150000_add_floor_image_dimensions.sql`
- `supabase/migrations/20251114150100_add_update_floor_dimensions_helper.sql`

### Client Code
- `game-client/src/lib/map/components/MapView.svelte`
- `game-client/src/types/database.types.ts` (auto-generated)

### Documentation
- `documentation/guides/map_floor_setup.md` (comprehensive guide)
- `IMAGE_DIMENSIONS_UPDATE.md` (this file)

## Support

For detailed information, see:
- **Comprehensive Guide**: `documentation/guides/map_floor_setup.md`
- **Map Mobile Responsive**: `documentation/guides/map_mobile_responsive.md`
- **Database Schema**: `supabase/migrations/20251114150000_add_floor_image_dimensions.sql`

---

**Last Updated**: November 14, 2025  
**Status**: ✅ Complete and Production Ready  
**Version**: 1.0.0