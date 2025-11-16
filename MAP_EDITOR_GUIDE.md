# Map Editor - User Guide 🗺️

A comprehensive, mobile-friendly map editor for managing floors and positioning points in the Congress Ingress game.

## 🎯 Features

- ✅ **Floor Management**: Create, edit, and delete floors
- ✅ **Image Upload**: Upload floor plan images (PNG, JPG, WebP, SVG)
- ✅ **Interactive Positioning**: Click/tap to position points on the map
- ✅ **Mobile-Friendly**: Full touch support with pinch-to-zoom
- ✅ **Real-time Preview**: See changes instantly
- ✅ **Batch Operations**: Save all positions at once

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Floor Management](#floor-management)
3. [Point Positioning](#point-positioning)
4. [Mobile Usage](#mobile-usage)
5. [Tips & Best Practices](#tips--best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure the storage bucket is set up. Run this SQL in Supabase:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-assets',
  'game-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
CREATE POLICY "Public Access for game-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-assets');

CREATE POLICY "Authenticated users can upload to game-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'game-assets' AND auth.role() = 'authenticated');
```

### Accessing the Editor

1. Navigate to `/admin` in your application
2. Click the **"Map Editor"** card
3. You're ready to start editing!

---

## 🏢 Floor Management

### Creating a New Floor

1. Click the **"Add Floor"** button in the top-right corner
2. Fill in the form:

   **Required Fields:**
   - **Floor Name**: Descriptive name (e.g., "Ground Floor", "1st Floor")

   **Optional Fields:**
   - **Building Name**: Building identifier (e.g., "Main Building", "Tower A")
   - **Display Order**: Number for sorting (lower appears first)
   - **Active**: Toggle to show/hide from players
   - **Floor Plan Image**: Upload your floor plan

3. Click **"Create Floor"**

#### Image Requirements

- **Formats**: PNG, JPG, WebP, SVG
- **Max Size**: 5MB
- **Recommended**: 1920x1080 or higher resolution
- **Tip**: PNG for photos, SVG for vector plans

### Editing a Floor

1. Find the floor card in the grid
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Update Floor"**

**Note**: Uploading a new image will automatically delete the old one.

### Deleting a Floor

1. Click **"Delete"** on the floor card
2. Confirm the deletion

⚠️ **Warning**: This will also remove all point positions on that floor!

### Floor Properties

| Property | Description | Default |
|----------|-------------|---------|
| **Name** | Display name for the floor | Required |
| **Building Name** | Optional building identifier | null |
| **Display Order** | Sort order (lower = first) | 0 |
| **Active** | Visible to players | true |
| **Map Image URL** | Floor plan image | Required |

---

## 📍 Point Positioning

### Overview

Position game points on your floor plan using an interactive map interface.

### Step-by-Step Guide

#### 1. Select a Floor

Click **"Edit Points"** on any floor card to open the positioning editor.

#### 2. Enable Placement Mode

Check the **"Enable point placement mode"** checkbox, or click a point in the list.

#### 3. Position Points

1. **Select a point** from the list on the left
2. **Click/tap** on the map where you want to place it
3. The point appears as a colored dot
4. **Click again** to move it to a new position
5. **Repeat** for all points

#### 4. Save Your Work

Click **"Save All Positions"** when you're done.

### Navigation Controls

#### Desktop

| Action | Control |
|--------|---------|
| **Zoom In/Out** | Scroll mouse wheel |
| **Pan** | Shift + Drag or Middle-click + Drag |
| **Place Point** | Left-click |
| **Select Point** | Click in list or on map |
| **Reset View** | Click "Reset View" button |

#### Mobile/Tablet

| Action | Control |
|--------|---------|
| **Zoom** | Pinch with two fingers |
| **Pan** | Drag with one finger (no point selected) |
| **Place Point** | Tap on map (point selected) |
| **Select Point** | Tap in list or on point |

### Point Information

Each point in the list shows:
- **Color-coded badge** indicating type
- **Point name**
- **Point type** (claimable, mini_game, not_claimable)
- **Position** (if placed) or "Not positioned"
- **Remove button** (❌) to delete position

### Point Type Colors

| Color | Type | Description |
|-------|------|-------------|
| 🔵 Blue (Primary) | Claimable | Points that can be claimed by factions |
| 🟣 Purple (Secondary) | Mini Game | Points with mini-games |
| 🟢 Green (Accent) | Not Claimable | Non-claimable points |

### Removing Positions

To remove a point from the map:
1. Find the point in the list
2. Click the **❌** button
3. The point is removed instantly

---

## 📱 Mobile Usage

The editor is fully optimized for mobile devices!

### Best Practices for Mobile

1. **Use Landscape Orientation**
   - Provides more screen space
   - Better for precision

2. **Zoom In for Accuracy**
   - Pinch to zoom before placing points
   - Ensures precise positioning

3. **Pan Before Placing**
   - Navigate to the area first
   - Then select and place your point

4. **Save Frequently**
   - Mobile connections can be unstable
   - Save after positioning a few points

### Touch Gestures

- **Single Tap**: Select point or place on map
- **Tap & Hold**: Select without placing
- **Drag (no point selected)**: Pan the map
- **Pinch**: Zoom in/out
- **Two-finger drag**: Alternative pan method

### Mobile Tips

- Clear background apps for better performance
- Use WiFi for image uploads
- Portrait mode works but landscape is better
- Close the editor when not in use to save battery

---

## 💡 Tips & Best Practices

### Floor Plan Images

✅ **Do:**
- Use high-resolution images (1920x1080+)
- Keep file size under 2MB for faster loading
- Use PNG for photographs
- Use SVG for vector floor plans
- Include room labels in the image
- Use consistent scale across floors

❌ **Don't:**
- Upload images over 5MB
- Use blurry or low-resolution images
- Mix different scales between floors
- Include sensitive information in images

### Display Order Best Practices

Use increments of 10 to allow inserting floors later:

```
Basement 2:   -20
Basement 1:   -10
Ground Floor:   0
1st Floor:     10
2nd Floor:     20
3rd Floor:     30
```

This allows you to insert "Mezzanine" at order 5 later!

### Point Positioning

1. **Be Consistent**: Use the same positioning logic across similar floors
2. **Zoom In**: Always zoom in for precise placement
3. **Check Scale**: Ensure the point size makes sense relative to rooms
4. **Test on Mobile**: Verify positions work on smaller screens
5. **Save Often**: Don't lose your work!

### Workflow Recommendations

#### For New Buildings

1. Create all floors first (inactive)
2. Upload floor plans for all floors
3. Set correct display order
4. Position points floor by floor
5. Test on mobile device
6. Activate floors when ready

#### For Updates

1. Make a note of what needs changing
2. Edit one floor at a time
3. Save after each floor
4. Test the changes
5. Move to next floor

---

## 🔧 Troubleshooting

### Upload Issues

**Problem**: "Failed to upload image"

**Solutions**:
- ✓ Check file size (max 5MB)
- ✓ Verify file format (PNG, JPG, WebP, SVG)
- ✓ Ensure you're logged in
- ✓ Check storage bucket exists (run setup SQL)
- ✓ Clear browser cache and retry

**Problem**: Image uploads but shows broken

**Solutions**:
- ✓ Check image URL in database
- ✓ Verify storage bucket is public
- ✓ Check browser console for CORS errors
- ✓ Test image URL directly in browser

### Position Issues

**Problem**: Points not appearing on map

**Solutions**:
- ✓ Verify point has been positioned (check list)
- ✓ Check if point is outside visible area (zoom out)
- ✓ Ensure floor image is loaded
- ✓ Refresh the page

**Problem**: Can't click to place points

**Solutions**:
- ✓ Enable placement mode checkbox
- ✓ Select a point from the list
- ✓ Check if point is already positioned
- ✓ Try refreshing the page

**Problem**: Positions saved but reset

**Solutions**:
- ✓ Check database permissions (RLS policies)
- ✓ Verify point_positions table exists
- ✓ Look for console errors
- ✓ Ensure using correct floor ID

### Performance Issues

**Problem**: Editor is slow or laggy

**Solutions**:
- ✓ Reduce image file size
- ✓ Close other browser tabs
- ✓ Use a modern browser (Chrome, Firefox, Safari)
- ✓ Check internet connection speed
- ✓ Clear browser cache

**Problem**: Touch controls not working

**Solutions**:
- ✓ Use a modern mobile browser
- ✓ Check browser supports touch events
- ✓ Disable browser extensions
- ✓ Clear cache and reload
- ✓ Try in incognito/private mode

### Database Issues

**Problem**: "Error loading floors"

**Solutions**:
- ✓ Run database migrations (see MAP_IMPLEMENTATION_SUMMARY.md)
- ✓ Check RLS policies allow read access
- ✓ Verify database connection
- ✓ Check browser console for specific error

**Problem**: "Error saving positions"

**Solutions**:
- ✓ Check point_positions table exists
- ✓ Verify RLS policies allow insert/update
- ✓ Ensure user is authenticated
- ✓ Check for duplicate position entries

### Coordinate Issues

**Problem**: Points appear in wrong location on game map

**Solutions**:
- ✓ Points are stored as percentages (0-100)
- ✓ Game map converts percentages to absolute coordinates
- ✓ Check if floor.image_width and floor.image_height are set correctly
- ✓ Verify coordinates are between 0-100 in database
- ✓ Test by placing point at center (50%, 50%)

**Problem**: Points positioned in editor but offset on game map

**Cause**: Coordinate system mismatch between editor and game display

**Solutions**:
- ✓ Editor saves percentages relative to image
- ✓ Game map must convert: `(percent / 100) * imageDimension`
- ✓ Check MapView.svelte has coordinate conversion code
- ✓ Verify floor dimensions match actual image

**Problem**: Points outside visible area

**Solutions**:
- ✓ Check if coordinates exceed 0-100 range
- ✓ Verify image loaded before positioning
- ✓ Zoom out in game map to find points
- ✓ Re-position points in editor if needed

---

## 📊 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Scroll` | Zoom in/out |
| `Shift + Drag` | Pan map |
| `Click` | Place/select point |
| `Esc` | Deselect point |

---

## 🎓 Tutorial: Your First Floor

Let's create your first floor step-by-step!

### Step 1: Create the Floor (2 minutes)

1. Click **"Add Floor"**
2. Enter name: "Ground Floor"
3. Set display order: 0
4. Keep active checked
5. Upload your floor plan image
6. Click **"Create Floor"**

### Step 2: Position Points (5 minutes)

1. Click **"Edit Points"** on your new floor
2. Check **"Enable point placement mode"**
3. Click the first point in the list
4. Click on the map where it should be
5. Repeat for all points
6. Click **"Save All Positions"**

### Step 3: Test on Mobile (2 minutes)

1. Open the map editor on your phone
2. Navigate to your floor
3. Try zooming and panning
4. Verify all points are visible
5. Make adjustments if needed

**Congratulations!** 🎉 You've created your first floor!

---

## 📚 Additional Resources

- **Database Schema**: See MAP_IMPLEMENTATION_SUMMARY.md
- **Storage Setup**: See MAP_EDITOR_SETUP.md
- **API Reference**: See lib/map/mapApi.ts
- **Type Definitions**: See lib/map/map.types.ts

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Look at browser console for errors
3. Verify database migrations are applied
4. Test with a simple floor plan
5. Check storage bucket permissions

---

## 🔄 Version History

- **v1.0** - Initial release with full mobile support
  - Floor CRUD operations
  - Image upload with storage
  - Interactive point positioning
  - Touch controls for mobile
  - Zoom and pan functionality

---

Made with ❤️ for Congress Ingress