# Quick Reference: Floor Plan Image Dimensions

## 🎯 Quick Start

### 1. Get Your Image Dimensions
```bash
# Linux/Mac
identify -format "%wx%h" floor-plan.png

# Mac (alternative)
sips -g pixelWidth -g pixelHeight floor-plan.png

# Windows PowerShell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\path\to\image.png")
"$($img.Width)x$($img.Height)"
$img.Dispose()
```

### 2. Insert New Floor
```sql
INSERT INTO public.floors (
  name, building_name, map_image_url,
  image_width, image_height, display_order
)
VALUES (
  'Floor Name', 'Building', 'https://storage.url/image.png',
  1920, 1080, 1  -- Replace with actual dimensions
);
```

### 3. Update Existing Floor
```sql
-- Recommended: Use helper function
SELECT update_floor_image_dimensions(1, 1920, 1080);

-- Alternative: Direct update
UPDATE floors SET image_width = 1920, image_height = 1080 WHERE id = 1;
```

## 📐 Coordinate System

```
(0, 0) ───────────────────► X (width)
  │
  │     Your Floor Plan
  │
  ▼
  Y (height)
```

- **Origin**: Top-left (0, 0)
- **Range**: X: 0 to width, Y: 0 to height
- **Example (1920×1080)**: Center = (960, 540)

## 🔧 Helper Functions

```sql
-- Get coordinate info
SELECT * FROM get_floor_coordinate_info(1);

-- Update dimensions
SELECT update_floor_image_dimensions(1, 1920, 1080);
```

## ✅ Verification

```sql
-- Check all floors
SELECT id, name, image_width, image_height FROM floors;

-- Find missing dimensions
SELECT id, name FROM floors 
WHERE image_width IS NULL OR image_height IS NULL;

-- Verify points within bounds
SELECT p.name, pp.x_coordinate, pp.y_coordinate,
  CASE WHEN pp.x_coordinate BETWEEN 0 AND f.image_width
    AND pp.y_coordinate BETWEEN 0 AND f.image_height
  THEN '✓' ELSE '✗' END as valid
FROM point_positions pp
JOIN point p ON pp.point_id = p.id
JOIN floors f ON pp.floor_id = f.id;
```

## 📍 Add Point to Floor

```sql
-- After getting coordinates from image editor
INSERT INTO point_positions (point_id, floor_id, x_coordinate, y_coordinate)
VALUES ('point-uuid', 1, 750.5, 320.8);
```

## 🖼️ Common Image Sizes

| Name | Dimensions | Aspect Ratio |
|------|-----------|--------------|
| HD | 1280×720 | 16:9 |
| Full HD | 1920×1080 | 16:9 |
| 2K | 2560×1440 | 16:9 |
| 4K | 3840×2160 | 16:9 |
| A4 (150 DPI) | 1240×1754 | ~√2:1 |
| A4 (300 DPI) | 2480×3508 | ~√2:1 |
| Square | 2048×2048 | 1:1 |

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Points misaligned | Update floor dimensions with actual image size |
| Image stretched | Check dimensions match actual image file |
| Points outside map | Verify point coordinates < image dimensions |
| Dimensions NULL | Run: `UPDATE floors SET image_width=1920, image_height=1080 WHERE id=1` |

## 💡 Best Practices

- ✅ Always set `image_width` and `image_height`
- ✅ Get dimensions from actual image file
- ✅ Use decimal coordinates for precision (e.g., 750.5)
- ✅ Keep images under 5MB for mobile performance
- ✅ Test on different screen sizes after updates
- ❌ Never leave dimensions as NULL
- ❌ Don't guess dimensions

## 📊 Recommended Sizes

- **Minimum**: 1280px shortest side
- **Recommended**: 1920px shortest side  
- **Maximum**: 4096px longest side
- **File Size**: < 5MB

## 🔄 Percentage to Pixel Conversion

```javascript
const x = (percentX / 100) * imageWidth;
const y = (percentY / 100) * imageHeight;
```

## 📚 Full Documentation

- Comprehensive Guide: `documentation/guides/map_floor_setup.md`
- Implementation Details: `IMAGE_DIMENSIONS_UPDATE.md`
- Mobile Responsive: `documentation/guides/map_mobile_responsive.md`

---

**Version**: 1.0.0 | **Date**: November 14, 2025