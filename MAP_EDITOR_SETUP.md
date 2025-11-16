# Map Editor Setup Guide

## Overview

The Map Editor is a comprehensive admin tool for managing floors and positioning points on the map. It includes:

- ✅ Floor management (add, edit, delete)
- ✅ Image upload for floor plans
- ✅ Interactive point positioning
- ✅ Mobile-friendly with touch support
- ✅ Zoom and pan controls
- ✅ Real-time preview

## Prerequisites

Before using the Map Editor, you need to set up the storage bucket for images.

## Step 1: Create Storage Bucket

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create the game-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-assets',
  'game-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access for game-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-assets');

CREATE POLICY "Authenticated users can upload to game-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-assets'
  AND auth.role() = 'authenticated'
);
```

## Step 2: Access the Map Editor

1. Navigate to `/admin` in your application
2. Click on "Map Editor"
3. You're ready to start!

## Using the Map Editor

### Managing Floors

#### Add a New Floor

1. Click "Add Floor" button
2. Fill in the form:
   - **Floor Name** (required): e.g., "Ground Floor", "1st Floor"
   - **Building Name** (optional): e.g., "Main Building"
   - **Display Order**: Number to control sort order (lower = first)
   - **Active**: Toggle to make floor visible to players
   - **Floor Plan Image**: Upload a floor plan (PNG, JPG, WebP, SVG - max 5MB)
3. Click "Create Floor"

#### Edit a Floor

1. Find the floor card in the grid
2. Click "Edit" button
3. Modify any fields
4. Click "Update Floor"

#### Delete a Floor

1. Find the floor card in the grid
2. Click "Delete" button
3. Confirm the deletion

**⚠️ Warning**: Deleting a floor will also remove all point positions on that floor!

### Positioning Points on the Map

#### Step 1: Select a Floor

1. Click "Edit Points" on any floor card
2. The point positioning editor will open

#### Step 2: Position Points

1. **Enable placement mode**: Check "Enable point placement mode" or click on a point in the list
2. **Select a point**: Click on a point from the list on the left
3. **Place the point**: Click/tap on the map where you want to position the point
4. **Adjust position**: Click again to move the point to a new location
5. **Repeat**: Select another point and place it
6. **Save**: Click "Save All Positions" when done

#### Navigation Controls

**Desktop:**
- **Zoom**: Scroll mouse wheel
- **Pan**: Hold Shift and drag, or middle-click and drag
- **Reset**: Click "Reset View" button

**Mobile/Tablet:**
- **Zoom**: Pinch with two fingers
- **Pan**: Drag with one finger (when no point is selected)
- **Place point**: Tap on map (when point is selected)

#### Point Types & Colors

- 🔵 **Blue (Primary)**: Claimable points
- 🟣 **Purple (Secondary)**: Mini-game points
- 🟢 **Green (Accent)**: Not claimable points

#### Removing Point Positions

To remove a point from the floor:
1. Find the point in the list
2. Click the ❌ button next to the positioned point
3. The point will be removed from the map

## File Structure

```
game-client/src/
├── routes/admin/map-editor/
│   ├── +page.svelte              # Main map editor page
│   ├── FloorEditor.svelte        # Floor add/edit form
│   └── PointPositionEditor.svelte # Interactive point positioning
└── lib/map/
    ├── storage.ts                # Storage utility functions
    ├── mapApi.ts                 # Map API functions
    └── map.types.ts              # Type definitions
```

## Features

### Floor Management
- ✅ Create, read, update, delete floors
- ✅ Upload floor plan images (PNG, JPG, WebP, SVG)
- ✅ Set display order
- ✅ Toggle floor active/inactive status
- ✅ Preview floor plan images
- ✅ Automatic image cleanup on update

### Point Positioning
- ✅ Visual point placement on floor plans
- ✅ Interactive map with zoom and pan
- ✅ Touch support for mobile devices
- ✅ Pinch-to-zoom on mobile
- ✅ Color-coded point types
- ✅ Real-time position updates
- ✅ Batch save all positions
- ✅ Remove individual positions
- ✅ Position preview in list

### Mobile Support
- ✅ Responsive design
- ✅ Touch-friendly controls
- ✅ Pinch to zoom
- ✅ One-finger pan (when not placing)
- ✅ Tap to place points
- ✅ Works on phones and tablets

## Troubleshooting

### "Failed to upload image"

**Possible causes:**
1. Storage bucket not created → Run the SQL from Step 1
2. File too large → Maximum 5MB
3. Invalid file type → Use PNG, JPG, WebP, or SVG
4. Not authenticated → Make sure you're logged in

### "Error loading floors"

**Possible causes:**
1. Database migration not run → Check MAP_IMPLEMENTATION_SUMMARY.md
2. RLS policies blocking access → Verify you're logged in as admin
3. Network issue → Check browser console

### Points not appearing on map

**Possible causes:**
1. Point not positioned yet → Position the point using the editor
2. Floor image not uploaded → Upload a floor plan image
3. Point position is outside visible area → Use zoom/pan to find it

### Touch controls not working on mobile

**Possible causes:**
1. Browser doesn't support touch events → Try a modern browser
2. Another element is capturing touch events → Check browser console
3. Touch-action CSS not applied → Clear browser cache

## Tips & Best Practices

1. **Floor Plan Images**: 
   - Use high-resolution images (1920x1080 or higher recommended)
   - Keep file size under 2MB for faster loading
   - Use PNG for best quality
   - Consider using SVG for vector floor plans

2. **Display Order**: 
   - Use increments of 10 (0, 10, 20) to allow inserting floors later
   - Ground floor typically = 0
   - Upper floors = 10, 20, 30, etc.
   - Basement floors = -10, -20, etc.

3. **Point Positioning**:
   - Zoom in for precise placement
   - Position points on actual room/area locations
   - Save frequently to avoid losing work
   - Use consistent positioning across similar floors

4. **Mobile Editing**:
   - Landscape orientation works best
   - Use two hands for pinch zoom
   - Tap and hold to select, then tap to place
   - Be patient with large images

## API Reference

### Storage Functions

```typescript
// Upload an image
import { uploadImage } from '$lib/map/storage';
const { url, error } = await uploadImage(file, 'floor-maps');

// Delete an image
import { deleteImage } from '$lib/map/storage';
await deleteImage(imageUrl);

// Check if bucket exists
import { checkBucketExists } from '$lib/map/storage';
const exists = await checkBucketExists();
```

### Map API Functions

```typescript
// Load all floors
import { loadFloors } from '$lib/map/mapApi';
const floors = await loadFloors();

// Load floor with points
import { loadFloorPoints } from '$lib/map/mapApi';
const { floor, points, discoveries } = await loadFloorPoints(floorId, userId);

// Update floor
import { updateFloor } from '$lib/map/mapApi';
await updateFloor(floorId, { name: 'New Name' });

// Upsert point position
import { upsertPointPosition } from '$lib/map/mapApi';
await upsertPointPosition({
  point_id: pointId,
  floor_id: floorId,
  x_coordinate: 50,
  y_coordinate: 50
});
```

## Next Steps

1. ✅ Set up storage bucket (Step 1)
2. ✅ Create your first floor
3. ✅ Upload a floor plan image
4. ✅ Position points on the map
5. ✅ Test on mobile devices
6. 🎯 Integrate with game mechanics
7. 🎯 Add player location tracking
8. 🎯 Implement fog-of-war visualization

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify database migrations are applied
3. Check storage bucket permissions
4. Review MAP_IMPLEMENTATION_SUMMARY.md
5. Test with a simple floor plan first

## Credits

Built with:
- Svelte 5 (Runes)
- Supabase (Database + Storage)
- DaisyUI (Styling)
- TypeScript