# Map System Admin Quick Start Guide

## Overview

This guide helps administrators set up and configure the map system for Congress Quest, including adding floor plans, positioning points, and managing the map configuration.

---

## Prerequisites

- Admin role in the system
- Access to Supabase dashboard or SQL editor
- Floor plan images (SVG, PNG, or JPEG format)
- List of points to position on the map

---

## Step 1: Upload Floor Plan Images

### Option A: Using Supabase Storage (Recommended)

1. **Create Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `floor-plans`
   - Make it **public** (for image loading)

2. **Upload Floor Plans:**
   - Upload your floor plan images (e.g., `ground-floor.svg`, `first-floor.png`)
   - Note the public URLs for each image

3. **Get Image URLs:**
   ```
   https://[your-project].supabase.co/storage/v1/object/public/floor-plans/ground-floor.svg
   ```

### Option B: Using External CDN

- Upload images to your preferred CDN/hosting
- Ensure images are publicly accessible
- Note the full URLs

### Floor Plan Image Tips

- **SVG format recommended** for best quality at any zoom level
- **Dimensions:** 1000x1000px to 2000x2000px recommended
- **Keep file size small** (<500KB) for fast loading
- **Use simple colors** - white background with gray/black lines
- **Label rooms/areas** if helpful for orientation

---

## Step 2: Add Floors to Database

### Using SQL Editor

```sql
-- Add your floors
INSERT INTO public.floors (name, building_name, map_image_url, display_order, is_active)
VALUES
  ('Ground Floor', 'Main Building', 'https://your-url/ground-floor.svg', 1, true),
  ('First Floor', 'Main Building', 'https://your-url/first-floor.svg', 2, true),
  ('Second Floor', 'Main Building', 'https://your-url/second-floor.svg', 3, true);

-- View created floors
SELECT * FROM public.floors ORDER BY display_order;
```

### Field Descriptions

- `name`: Display name (e.g., "Ground Floor", "Basement", "Roof")
- `building_name`: Optional building identifier (for multi-building support)
- `map_image_url`: Full URL or path to floor plan image
- `display_order`: Sort order (lower numbers appear first)
- `is_active`: Set to `false` to hide a floor without deleting it

---

## Step 3: Position Points on Floors

### Understanding Coordinates

Coordinates represent pixel positions on your floor plan image:
- `x_coordinate`: Horizontal position (0 = left edge)
- `y_coordinate`: Vertical position (0 = top edge)
- Based on image dimensions (e.g., 0-1000 for 1000px wide image)

### Method 1: Manual SQL Entry

```sql
-- Get list of all points
SELECT id, name FROM public.point ORDER BY name;

-- Add point positions one by one
INSERT INTO public.point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES
  ('point-uuid-1', 1, 250, 150),
  ('point-uuid-2', 1, 750, 300),
  ('point-uuid-3', 2, 500, 500);

-- View all positioned points
SELECT 
  pp.id,
  p.name as point_name,
  f.name as floor_name,
  pp.x_coordinate,
  pp.y_coordinate
FROM public.point_positions pp
JOIN public.point p ON pp.point_id = p.id
JOIN public.floors f ON pp.floor_id = f.id
ORDER BY f.display_order, p.name;
```

### Method 2: Batch Import via CSV

1. **Create a CSV file** (`point_positions.csv`):
```csv
point_id,floor_id,x_coordinate,y_coordinate
550e8400-e29b-41d4-a716-446655440000,1,250,150
550e8400-e29b-41d4-a716-446655440001,1,750,300
550e8400-e29b-41d4-a716-446655440002,2,500,500
```

2. **Import using psql or SQL editor:**
```sql
-- Using COPY command (psql)
\COPY public.point_positions (point_id, floor_id, x_coordinate, y_coordinate) 
FROM 'point_positions.csv' 
CSV HEADER;
```

### Method 3: Visual Editor (Future Feature)

The admin UI will include a drag-and-drop point positioning tool. Coming in Phase 4.

---

## Step 4: Update Point Positions

```sql
-- Update a single point's position
UPDATE public.point_positions
SET x_coordinate = 300, y_coordinate = 400
WHERE point_id = 'your-point-uuid';

-- Move a point to a different floor
UPDATE public.point_positions
SET floor_id = 2, x_coordinate = 100, y_coordinate = 200
WHERE point_id = 'your-point-uuid';
```

---

## Step 5: Verify Setup

### Check Floors

```sql
-- List all active floors
SELECT id, name, building_name, display_order, is_active
FROM public.floors
WHERE is_active = true
ORDER BY display_order;
```

### Check Point Coverage

```sql
-- Count points per floor
SELECT 
  f.name as floor_name,
  COUNT(pp.id) as point_count
FROM public.floors f
LEFT JOIN public.point_positions pp ON f.id = pp.floor_id
GROUP BY f.id, f.name
ORDER BY f.display_order;

-- List points without positions
SELECT p.id, p.name, p.type
FROM public.point p
LEFT JOIN public.point_positions pp ON p.id = pp.point_id
WHERE pp.id IS NULL;
```

### Test Visibility in Client

1. Open the game client as a regular user
2. Navigate to the map view
3. Verify:
   - Floors are listed correctly
   - Points appear on correct floors
   - Images load properly
   - Coordinates are accurate

---

## Common Tasks

### Disable a Floor Temporarily

```sql
UPDATE public.floors
SET is_active = false
WHERE id = 2;
```

### Change Floor Order

```sql
-- Swap display order of two floors
UPDATE public.floors SET display_order = 10 WHERE id = 1; -- temp value
UPDATE public.floors SET display_order = 1 WHERE id = 2;
UPDATE public.floors SET display_order = 2 WHERE id = 1;
```

### Update Floor Plan Image

```sql
UPDATE public.floors
SET map_image_url = 'https://new-url/updated-floor-plan.svg'
WHERE id = 1;
```

### Remove Point from Map

```sql
-- Delete point position (point still exists in game)
DELETE FROM public.point_positions
WHERE point_id = 'your-point-uuid';
```

### Move All Points from One Floor to Another

```sql
UPDATE public.point_positions
SET floor_id = 2
WHERE floor_id = 1;
```

---

## Coordinate Finding Tips

### Method 1: Image Editor
1. Open floor plan in image editor (GIMP, Photoshop, etc.)
2. Enable ruler/coordinates display
3. Hover over desired point location
4. Note X,Y coordinates

### Method 2: Browser DevTools
1. Open floor plan image in browser
2. Open browser DevTools (F12)
3. Use console:
```javascript
document.querySelector('img').addEventListener('click', (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  console.log(`X: ${x}, Y: ${y}`);
});
```
4. Click on image to get coordinates

### Method 3: Online Tool
- Use online SVG editors with coordinate display
- Draw circles at point locations and export coordinates

---

## Sample Data for Testing

```sql
-- Add test floors
INSERT INTO public.floors (name, building_name, map_image_url, display_order, is_active)
VALUES
  ('Test Floor 1', 'Test Building', '/floor-plans/test-floor-1.svg', 1, true),
  ('Test Floor 2', 'Test Building', '/floor-plans/test-floor-2.svg', 2, true);

-- Assuming you have points already created, position them
-- Replace UUIDs with your actual point IDs
INSERT INTO public.point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES
  ((SELECT id FROM public.point WHERE name = 'Point A'), 1, 100, 100),
  ((SELECT id FROM public.point WHERE name = 'Point B'), 1, 200, 150),
  ((SELECT id FROM public.point WHERE name = 'Point C'), 2, 300, 200);
```

---

## Troubleshooting

### Issue: Floor images not loading

**Check:**
- Image URL is correct and publicly accessible
- CORS is enabled on image host
- Image file is not corrupted
- Browser console for specific errors

**Solution:**
```sql
-- Verify URL
SELECT id, name, map_image_url FROM public.floors;

-- Update if incorrect
UPDATE public.floors SET map_image_url = 'correct-url' WHERE id = 1;
```

### Issue: Points not appearing on map

**Check:**
- Point has position entry in `point_positions` table
- Coordinates are within image bounds
- Floor is active (`is_active = true`)

**Solution:**
```sql
-- Find points without positions
SELECT p.* FROM public.point p
LEFT JOIN public.point_positions pp ON p.id = pp.point_id
WHERE pp.id IS NULL;

-- Add missing positions
INSERT INTO public.point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES ('missing-point-id', 1, 500, 500);
```

### Issue: Points in wrong location

**Solution:**
```sql
-- Check current position
SELECT pp.*, p.name 
FROM public.point_positions pp
JOIN public.point p ON pp.point_id = p.id
WHERE p.name = 'Problem Point';

-- Update position
UPDATE public.point_positions
SET x_coordinate = 400, y_coordinate = 300
WHERE point_id = 'problem-point-id';
```

### Issue: Duplicate point positions

**This shouldn't happen** due to UNIQUE constraint, but if it does:
```sql
-- Find duplicates
SELECT point_id, COUNT(*) 
FROM public.point_positions 
GROUP BY point_id 
HAVING COUNT(*) > 1;

-- Keep only the most recent
DELETE FROM public.point_positions
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.point_positions 
  GROUP BY point_id
);
```

---

## Security Notes

- Only admins can modify floors and point positions (enforced by RLS)
- All users can view floors and positions (needed for map display)
- Floor images must be publicly accessible (no authentication required)
- Do not include sensitive information in floor plan images

---

## Best Practices

1. **Use consistent coordinate systems** across all floors
2. **Test with a few points first** before positioning all points
3. **Keep floor plans simple** - avoid excessive detail
4. **Use SVG format** for scalable, sharp images
5. **Document your coordinate system** (e.g., "0,0 is top-left, 1000,1000 is bottom-right")
6. **Back up data** before bulk operations
7. **Use descriptive floor names** that players will understand
8. **Order floors logically** (ground floor first, then ascending)

---

## Next Steps

After basic setup:
1. Test map in client application
2. Gather player feedback on point positions
3. Adjust positions as needed
4. Add more floors as building expands
5. Consider adding building names for multi-building support

---

## Reference

- Migration File: `supabase/migrations/20251114135117_add_map_system.sql`
- Implementation Doc: `documentation/implementation/map_system_implementation.md`
- Design Doc: `documentation/concepts/2025_11_14_map.md`

---

**Questions?** Check the implementation documentation or contact the development team.