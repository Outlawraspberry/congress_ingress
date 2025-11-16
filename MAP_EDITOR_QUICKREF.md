# Map Editor - Quick Reference 🚀

## 🎯 Getting Started

```bash
# 1. Navigate to admin panel
/admin → Map Editor

# 2. Ensure storage bucket exists (run once in Supabase SQL)
# See MAP_EDITOR_SETUP.md for SQL
```

## 🏢 Floor Management

| Action | Steps |
|--------|-------|
| **Add Floor** | Click "Add Floor" → Fill form → Upload image → Create |
| **Edit Floor** | Click "Edit" on card → Modify → Update |
| **Delete Floor** | Click "Delete" → Confirm ⚠️ (removes all positions) |
| **Position Points** | Click "Edit Points" → Select point → Click map → Save |

## 📋 Floor Form Fields

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| Floor Name | ✅ | - | e.g., "Ground Floor" |
| Building Name | ❌ | null | e.g., "Main Building" |
| Display Order | ❌ | 0 | Lower = first (use 0, 10, 20...) |
| Active | ❌ | true | Toggle visibility to players |
| Floor Plan | ❌ | - | PNG/JPG/WebP/SVG, max 5MB |

## 🎮 Map Controls

### Desktop
| Action | Control |
|--------|---------|
| Zoom | Scroll wheel |
| Pan | Shift + Drag or Middle-click + Drag |
| Place Point | Click |
| Reset View | "Reset View" button |

### Mobile/Tablet
| Action | Control |
|--------|---------|
| Zoom | Pinch (2 fingers) |
| Pan | Drag (1 finger) |
| Place Point | Tap |

## 🎨 Point Types

| Color | Type | Badge |
|-------|------|-------|
| 🔵 Blue | Claimable | Primary |
| 🟣 Purple | Mini Game | Secondary |
| 🟢 Green | Not Claimable | Accent |

## 📍 Point Positioning Workflow

```
1. Select floor → "Edit Points"
2. ☑ Enable point placement mode
3. Click point in list
4. Click map location
5. Repeat for all points
6. "Save All Positions"
```

## 🖼️ Image Best Practices

✅ **DO**
- Use 1920x1080+ resolution
- Keep under 2MB
- PNG for photos, SVG for vectors
- Include room labels

❌ **DON'T**
- Upload files over 5MB
- Use blurry images
- Mix scales between floors

## 🔢 Display Order Strategy

```
-20  Basement 2
-10  Basement 1
  0  Ground Floor    ← Start here
 10  1st Floor
 20  2nd Floor
 30  3rd Floor
```

**Why increment by 10?** Allows inserting floors later (e.g., Mezzanine at 5)

## ⚡ Quick Actions

| Task | Shortcut |
|------|----------|
| New floor | Click "Add Floor" |
| Save positions | Ctrl/Cmd + S (or button) |
| Deselect point | Click elsewhere or Esc |
| Zoom reset | "Reset View" |

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Upload fails | Check size (<5MB), format (PNG/JPG/WebP/SVG), logged in |
| Can't place points | Enable placement mode, select a point first |
| Points not saving | Check database permissions, verify migrations |
| Slow performance | Reduce image size, close other tabs |
| Touch not working | Use modern browser, try incognito mode |

## 📊 Position Coordinates

- **Format**: Percentage (0-100%)
- **Origin**: Top-left corner (Editor), Bottom-left (Game Map)
- **X**: Left (0%) → Right (100%)
- **Y**: Top (0%) → Bottom (100%) in editor
- **Y-Axis Inversion**: Game map inverts Y (DOM coords → Geographic coords)
- **Storage**: Y=0 is top (DOM convention)
- **Display**: Leaflet inverts Y=0 to bottom

## 🔧 Storage Bucket Setup

**One-time setup** (run in Supabase SQL Editor):

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('game-assets', 'game-assets', true, 5242880, 
        ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies (see MAP_EDITOR_SETUP.md)
```

## 📱 Mobile Tips

1. **Use landscape** orientation
2. **Zoom in** before placing points
3. **Save frequently** (unreliable connections)
4. **WiFi recommended** for image uploads
5. **Close other apps** for performance

## 🎯 Positioning Tips

- **Zoom in** for precision (3x recommended)
- **Pan first**, then place
- **Check on mobile** after desktop edits
- **Be consistent** across similar floors
- **Test visibility** at different zoom levels

## 📏 Recommended Image Specs

| Property | Recommended | Maximum |
|----------|-------------|---------|
| Resolution | 1920×1080 | Any |
| File Size | 500KB-2MB | 5MB |
| Format | PNG or SVG | PNG/JPG/WebP/SVG |
| Aspect Ratio | Match building | Any |
| DPI | 72-150 | Any |

**Coordinate System Note**: Points are stored with Y=0 at top (DOM), but displayed with Y=0 at bottom (Leaflet). The game map automatically inverts Y coordinates.

## 🚨 Before Going Live

- [ ] All floors created
- [ ] All images uploaded
- [ ] All points positioned
- [ ] Tested on mobile
- [ ] Display order correct
- [ ] Active status set correctly

## 💾 Database Tables

| Table | Purpose |
|-------|---------|
| `floors` | Floor metadata |
| `point_positions` | Point coordinates |
| `point` | Game points |
| `storage.objects` | Uploaded images |

## 🔗 Quick Links

- **Full Guide**: MAP_EDITOR_GUIDE.md
- **Setup**: MAP_EDITOR_SETUP.md
- **Implementation**: MAP_IMPLEMENTATION_SUMMARY.md
- **API Docs**: game-client/src/lib/map/mapApi.ts

## 🆘 Emergency Commands

```sql
-- List all floors
SELECT * FROM floors ORDER BY display_order;

-- Count positioned points per floor
SELECT floor_id, COUNT(*) FROM point_positions GROUP BY floor_id;

-- Find unpositioned points
SELECT p.* FROM point p 
LEFT JOIN point_positions pp ON p.id = pp.point_id 
WHERE pp.point_id IS NULL;

-- Check coordinate ranges (should be 0-100)
SELECT point_id, x_coordinate, y_coordinate 
FROM point_positions 
WHERE x_coordinate < 0 OR x_coordinate > 100 
   OR y_coordinate < 0 OR y_coordinate > 100;

-- Delete all positions for a floor (⚠️ destructive)
DELETE FROM point_positions WHERE floor_id = 1;
```

## 📞 Support Checklist

When reporting issues, include:
1. Browser & version
2. Device type (desktop/mobile)
3. Error message from console
4. Steps to reproduce
5. Screenshot if applicable

---

**Made with ❤️ for Congress Ingress**