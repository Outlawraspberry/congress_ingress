# Map System Implementation Summary

## Status: Phase 1 - Database & Types Complete ✅

---

## Overview

This document tracks the implementation of the map system for Congress Quest, including floor-based navigation, point positioning, fog-of-war mechanics, and faction intelligence features.

**Implementation Date:** 2025-11-14  
**Current Phase:** Database schema and TypeScript types complete  
**Next Phase:** Svelte components and API integration

---

## Completed Work

### 1. Database Schema ✅

**Migration File:** `supabase/migrations/20251114135117_add_map_system.sql`

#### Tables Created:

**a) `floors` Table**
- Stores floor plan configuration with image URLs
- Fields:
  - `id` (SERIAL PRIMARY KEY)
  - `name` (TEXT) - e.g., "Ground Floor", "First Floor"
  - `building_name` (TEXT) - e.g., "Main Building"
  - `map_image_url` (TEXT) - URL/path to floor plan image
  - `display_order` (INTEGER) - Sort order for UI
  - `is_active` (BOOLEAN) - Enable/disable floors
  - `created_at`, `updated_at` (TIMESTAMPTZ)

**b) `point_positions` Table**
- Maps points to floor locations
- Fields:
  - `id` (UUID PRIMARY KEY)
  - `point_id` (UUID FK → points.id) - UNIQUE constraint
  - `floor_id` (INTEGER FK → floors.id)
  - `x_coordinate` (DECIMAL) - X position on floor plan
  - `y_coordinate` (DECIMAL) - Y position on floor plan
  - `created_at`, `updated_at` (TIMESTAMPTZ)

**c) `point_discoveries` Table**
- Tracks which users have discovered which points (fog-of-war)
- Fields:
  - `id` (UUID PRIMARY KEY)
  - `user_id` (UUID FK → auth.users.id)
  - `point_id` (UUID FK → points.id)
  - `discovered_at` (TIMESTAMPTZ)
  - UNIQUE constraint on (user_id, point_id)

#### Database Functions Created:

1. **`mark_point_discovered()`** - Trigger function
   - Automatically marks points as discovered when user visits (scans QR)
   - Called by trigger on `point_user` table INSERT

2. **`get_user_discoveries(p_user_id UUID)`** - Query function
   - Returns all points discovered by a specific user
   - Returns: point_id, discovered_at

3. **`has_user_discovered_point(p_user_id UUID, p_point_id UUID)`** - Check function
   - Boolean check if user has discovered a specific point

4. **`get_floor_points_with_discovery(p_user_id UUID, p_floor_id INTEGER)`** - Combined query
   - Returns all points on a floor with discovery status
   - Includes: point details, position, and is_discovered flag

#### Triggers Created:

- **`trigger_mark_point_discovered`** on `point_user` table
  - Fires AFTER INSERT
  - Calls `mark_point_discovered()` function
  - Automatically discovers points when QR code is scanned

- **Timestamp update triggers** on `floors` and `point_positions`
  - Updates `updated_at` field automatically

#### Row Level Security (RLS):

**Floors Table:**
- SELECT: All authenticated users can view active floors
- INSERT/UPDATE/DELETE: Admin only

**Point Positions Table:**
- SELECT: All authenticated users (public information)
- INSERT/UPDATE/DELETE: Admin only

**Point Discoveries Table:**
- SELECT: Users can only see their own discoveries
- INSERT: Users can only mark their own discoveries
- UPDATE/DELETE: Not allowed (discoveries are permanent)

#### Realtime Enabled:
- `floors` - For admin configuration updates
- `point_positions` - For admin position updates
- `point_discoveries` - For discovery notifications

---

### 2. TypeScript Types ✅

**File:** `types/database.types.ts`

Added type definitions for:
- `Tables<'floors'>`
- `Tables<'point_positions'>`
- `Tables<'point_discoveries'>`

Including full Row, Insert, Update, and Relationships types.

**File:** `game-client/src/lib/map/map.types.ts`

Created comprehensive type system including:

#### Core Types:
- `Floor` - Floor configuration
- `PointPosition` - Point spatial data
- `PointDiscovery` - Discovery tracking
- `MapPoint` - Combined point with position and visibility
- `CachedPointState` - Enemy point cache structure
- `FloorWithPoints` - Floor with all its points
- `PointPlayerPresence` - Player count at points

#### Visibility System:
- `PointVisibilityInfo` - What information is visible
- `VisibilityReason` - Why visibility is granted/denied
- Enum values: OwnFaction, Visited, EnemyCached, Undiscovered, MiniGameHidden

#### State Management:
- `MapState` - Main map state structure
- `MapConfig` - Map configuration options
- `MapAction` - Redux-style actions
- `MapEventHandlers` - Real-time event callbacks

#### UI Component Props:
- `PointMarkerProps` - For point markers
- `FloorSwitcherProps` - For floor selector
- `PointInfoPanelProps` - For point details panel
- `MapLegendProps` - For map legend

#### Utility Types:
- `Coordinates` - X/Y position
- `BoundingBox` - Map viewport bounds
- `ZoomConfig` - Zoom level settings
- `MapFilters` - Display filters

#### Helper Functions:
- `isClaimablePoint()` - Type guard
- `isMiniGamePoint()` - Type guard
- `isOwnFactionPoint()` - Ownership check
- `isEnemyPoint()` - Enemy check
- `isCacheStale()` - Cache validation
- `getHealthPercentage()` - Health calculation
- `getPointStatus()` - Status string

---

### 3. Local Storage System ✅

**File:** `game-client/src/lib/map/mapStorage.ts`

Created `MapStorageManager` class for client-side caching.

#### Storage Keys:
- `congress_quest_map_cache` - Main cache
- Legacy keys for migration support

#### Storage Structure:
```typescript
{
  version: 1,
  enemyCache: { [pointId]: CachedPointState },
  discoveries: string[],
  lastFloorId: number | null,
  lastUpdated: string
}
```

#### Enemy Cache Operations:
- `getEnemyPointCache(pointId)` - Get single cached state
- `getAllEnemyCache()` - Get all cached states
- `updateEnemyPointCache(cache)` - Update single cache
- `updateMultipleEnemyCache(caches)` - Batch update
- `removeEnemyPointCache(pointId)` - Remove cache
- `clearEnemyCache()` - Clear all cache
- `cleanStaleCache(hours)` - Remove expired entries
- `isCacheStale(pointId, hours)` - Check if stale

#### Discovery Operations:
- `getDiscoveries()` - Get all discovered point IDs
- `isPointDiscovered(pointId)` - Check if discovered
- `addDiscovery(pointId)` - Mark as discovered
- `addMultipleDiscoveries(pointIds)` - Batch mark
- `syncDiscoveries(serverDiscoveries)` - Sync with server

#### Floor Operations:
- `getLastFloorId()` - Get last visited floor
- `setLastFloorId(floorId)` - Save last visited floor

#### Utility Operations:
- `clearAll()` - Clear all data
- `exportData()` - Export for debugging
- `importData(json)` - Import data
- `getStats()` - Get storage statistics

#### Helper Functions:
- `createCachedState()` - Create cache entry
- `formatTimeSinceUpdate()` - Human-readable time

---

## Design Decisions

### 1. Separate Position Table
- Keeps `points` table clean and focused on game state
- Allows points to exist without map positions
- Easy to update positions without affecting game logic
- Can add multiple positions per point in future (if needed)

### 2. Configurable Floor Images
- `floors.map_image_url` stores path/URL to floor plan image
- Admins can update floor plans without code changes
- Supports SVG, PNG, or any web-compatible format
- Can be absolute URLs or relative paths

### 3. Automatic Discovery on QR Scan
- Trigger on `point_user` INSERT automatically marks discovery
- No manual API calls needed for discovery
- Guaranteed consistency between visit and discovery
- Works seamlessly with existing QR code system

### 4. Client-Side Enemy Cache
- Reduces server load (no need to query stale data)
- Works offline
- User-specific (each player has own cache)
- Automatic stale detection and cleanup
- Syncs when points are visited

### 5. Permanent Discoveries
- No UPDATE or DELETE on `point_discoveries`
- Once discovered, always visible
- Simplifies logic and prevents bugs
- Matches game design (knowledge persists)

---

## Visibility Rules Implementation

Based on the approved design:

### Claimable Points:

**Your Faction's Points:**
- ✅ Always visible (location + name)
- ✅ Real-time updates via Supabase subscription
- ✅ Full health, level, and state information
- ✅ Player presence count

**Enemy Faction Points:**
- ✅ Always visible (location known)
- ⚠️ Show cached/last known state only
- ⚠️ Health and level frozen at last visit
- ⚠️ Display "Last updated: X ago" timestamp
- 🔄 Updates when any faction member visits

**Unvisited Points (by you):**
- ✅ Visible as gray markers
- ❌ No name or details shown
- ℹ️ Exception: Your faction's points show full info

**Visited Points (by you):**
- ✅ Name permanently revealed
- ✅ Visible on mini-map with label
- 🔄 State follows faction intelligence rules

### Mini-Game Points:
- ❌ Hidden until discovered (first QR scan)
- ✅ Permanently visible after discovery
- 💡 Creates exploration value

---

## Next Steps

### Phase 2: API & Stores (To Do)

1. **Supabase Client Functions**
   - `loadFloors()` - Fetch all floors
   - `loadFloorPoints(floorId, userId)` - Get points for floor
   - `subscribeToPoints(floorId, factionId)` - Real-time updates
   - `subscribeToPlayerPresence(floorId)` - Player counts
   - `updateVisitCache(pointId, state)` - After visiting enemy point

2. **Svelte Stores**
   - `mapStore.ts` - Main map state management
   - `floorStore.ts` - Current floor selection
   - `visibilityStore.ts` - Fog-of-war logic
   - `cacheStore.ts` - Enemy cache integration

### Phase 3: UI Components (To Do)

1. **Core Components**
   - `MapView.svelte` - Main map container with Leaflet
   - `FloorSwitcher.svelte` - Floor selection UI
   - `PointMarker.svelte` - Individual point markers
   - `PointInfoPanel.svelte` - Point details sidebar
   - `MapLegend.svelte` - Color/symbol key

2. **Supporting Components**
   - `MiniMap.svelte` - Always-visible small map
   - `PlayerPresenceIndicator.svelte` - Player count badges
   - `CacheStatusBadge.svelte` - "Last updated" indicator
   - `MapFilters.svelte` - Toggle visibility filters

### Phase 4: Admin Tools (To Do)

1. **Floor Management**
   - Upload/configure floor plan images
   - Set floor names and display order
   - Toggle floor active/inactive

2. **Point Position Editor**
   - Visual drag-and-drop point placement
   - Coordinate input fields
   - Batch import positions (CSV/JSON)
   - Preview mode

### Phase 5: Testing & Polish (To Do)

1. **Testing**
   - Unit tests for visibility logic
   - Integration tests for cache system
   - E2E tests for map interactions
   - Performance testing with 50+ points

2. **Polish**
   - Smooth animations for point updates
   - Loading states and skeletons
   - Error handling and retry logic
   - Mobile responsiveness
   - Accessibility (keyboard nav, screen readers)

---

## Database Migration Checklist

To deploy this migration:

1. **Backup database** (recommended)
2. **Run migration:**
   ```bash
   cd supabase
   npx supabase db push
   ```
3. **Verify tables created:**
   ```sql
   SELECT * FROM public.floors;
   SELECT * FROM public.point_positions;
   SELECT * FROM public.point_discoveries;
   ```
4. **Test triggers:**
   ```sql
   -- Insert test point_user entry and verify discovery is created
   ```
5. **Verify RLS policies** in Supabase dashboard
6. **Verify realtime enabled** for all three tables
7. **Add sample floor data** (see migration comments)

---

## Configuration Notes

### Floor Image URLs

Floor images can be:
- **Relative paths:** `/floor-plans/ground-floor.svg`
- **Absolute URLs:** `https://cdn.example.com/maps/floor1.png`
- **Supabase Storage:** `[supabase-url]/storage/v1/object/public/floor-plans/...`

Recommended: Use Supabase Storage for floor plan images.

### Coordinate System

- Coordinates are stored as `DECIMAL(10, 2)`
- Unit is flexible (pixels, meters, relative units)
- Recommend using pixel coordinates matching image dimensions
- Example: For 1000x1000px image, use 0-1000 range

### Cache Expiration

Default: 24 hours (configurable in UI)
- Mini-game points: Never expire (permanent after discovery)
- Enemy claimable points: Configurable expiration
- Can be adjusted per-user in future

---

## File Structure

```
congress-ingress/
├── supabase/migrations/
│   └── 20251114135117_add_map_system.sql ✅
├── types/
│   └── database.types.ts ✅ (updated)
├── game-client/src/lib/map/
│   ├── map.types.ts ✅
│   ├── mapStorage.ts ✅
│   ├── mapStore.ts (TODO)
│   ├── visibilityRules.ts (TODO)
│   └── components/
│       ├── MapView.svelte (TODO)
│       ├── FloorSwitcher.svelte (TODO)
│       ├── PointMarker.svelte (TODO)
│       ├── PointInfoPanel.svelte (TODO)
│       └── MapLegend.svelte (TODO)
└── documentation/
    ├── concepts/2025_11_14_map.md ✅
    └── implementation/map_system_implementation.md ✅ (this file)
```

---

## Known Issues / Future Considerations

1. **Multi-building Support:** Current design assumes single building. Can add `buildings` table in future.

2. **3D Floors:** If needed, could add `floor_level` (integer) separate from `floor_id` for vertical positioning.

3. **Point Movement:** Currently points have fixed positions. If points need to move, add `point_position_history` table.

4. **Faction-Wide Intelligence:** Currently user-specific cache. Could add faction-shared cache in future.

5. **Real-time Cache Updates:** When ally visits enemy point, currently doesn't notify other faction members. Could add notification system.

6. **Performance:** With 100+ points per floor, may need marker clustering or canvas rendering.

---

## References

- Design Document: `documentation/concepts/2025_11_14_map.md`
- Database Schema: `supabase/migrations/20251114135117_add_map_system.sql`
- TypeScript Types: `game-client/src/lib/map/map.types.ts`
- Storage System: `game-client/src/lib/map/mapStorage.ts`

---

**Last Updated:** 2025-11-14  
**Next Review:** After Phase 2 completion