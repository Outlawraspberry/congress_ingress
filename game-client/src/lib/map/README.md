# Map System Module

## Overview

This directory contains the map system implementation for Congress Quest, including floor-based navigation, point positioning, fog-of-war mechanics, and faction intelligence features.

## Status

**Current Phase:** Database & Types Complete ✅  
**Next Phase:** Svelte Components & API Integration

---

## Files

### Completed ✅

- **`map.types.ts`** - TypeScript type definitions
  - Core types: Floor, PointPosition, MapPoint, CachedPointState
  - Visibility system types and enums
  - State management types (MapState, MapConfig, MapAction)
  - UI component prop types
  - Helper functions and type guards

- **`mapStorage.ts`** - Local storage manager for client-side caching
  - Enemy point state caching
  - Discovery tracking (fog-of-war)
  - Last visited floor persistence
  - Automatic stale cache cleanup
  - Export/import utilities

### To Be Implemented 🔨

- **`mapStore.ts`** - Svelte stores for map state management
- **`visibilityRules.ts`** - Fog-of-war logic implementation
- **`mapApi.ts`** - Supabase API functions for map data
- **`components/`** - Svelte components directory
  - `MapView.svelte` - Main map container with Leaflet
  - `FloorSwitcher.svelte` - Floor selection UI
  - `PointMarker.svelte` - Individual point markers
  - `PointInfoPanel.svelte` - Point details sidebar
  - `MapLegend.svelte` - Map legend/key
  - `MiniMap.svelte` - Always-visible mini-map

---

## Database Schema

The map system uses three new tables:

### `floors`
Stores floor plan configuration with image URLs.

```sql
CREATE TABLE public.floors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  building_name TEXT,
  map_image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `point_positions`
Maps points to floor locations.

```sql
CREATE TABLE public.point_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
  floor_id INTEGER NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  x_coordinate DECIMAL(10, 2) NOT NULL,
  y_coordinate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(point_id)
);
```

### `point_discoveries`
Tracks which users have discovered which points (fog-of-war).

```sql
CREATE TABLE public.point_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, point_id)
);
```

**Migration:** `supabase/migrations/20251114135117_add_map_system.sql`

---

## Usage Examples

### Using the Storage Manager

```typescript
import { mapStorage, createCachedState } from '$lib/map/mapStorage';

// Get discovered points
const discoveries = mapStorage.getDiscoveries();
const isDiscovered = mapStorage.isPointDiscovered('point-id');

// Cache enemy point state
const cache = createCachedState(
  'enemy-point-id',
  100, // health
  255, // maxHealth
  2,   // level
  'enemy-faction-id'
);
mapStorage.updateEnemyPointCache(cache);

// Retrieve cached state
const cachedState = mapStorage.getEnemyPointCache('enemy-point-id');

// Clean stale cache (older than 24 hours)
mapStorage.cleanStaleCache(24);

// Get storage statistics
const stats = mapStorage.getStats();
console.log(`Cached points: ${stats.totalCachedPoints}`);
console.log(`Discoveries: ${stats.totalDiscoveries}`);
```

### Using Type Guards

```typescript
import { 
  isClaimablePoint, 
  isMiniGamePoint, 
  isOwnFactionPoint,
  getHealthPercentage,
  getPointStatus 
} from '$lib/map/map.types';

if (isClaimablePoint(point)) {
  // Show action buttons
}

if (isMiniGamePoint(point) && !point.isDiscovered) {
  // Hide from map
}

if (isOwnFactionPoint(point, userFactionId)) {
  // Show real-time updates
}

const healthPercent = getHealthPercentage(point);
const status = getPointStatus(point); // "Healthy", "Damaged", etc.
```

---

## Visibility Rules (Faction Intelligence Model)

### Claimable Points

**Your Faction:**
- ✅ Always visible with real-time updates
- ✅ Full information (health, level, player count)

**Enemy Factions:**
- ✅ Always visible (location known)
- ⚠️ Shows cached/last known state only
- ⚠️ Updates when visited by any faction member

**Unvisited by You:**
- ✅ Visible as gray marker
- ❌ No name or details (except own faction)

**Visited by You:**
- ✅ Name permanently revealed
- 🔄 State follows faction rules above

### Mini-Game Points

- ❌ Hidden until first visit (QR scan)
- ✅ Permanently visible after discovery
- 💡 Creates exploration incentive

---

## Local Storage Schema

```typescript
{
  version: 1,
  enemyCache: {
    "point-id-1": {
      pointId: "point-id-1",
      health: 100,
      maxHealth: 255,
      level: 2,
      factionId: "enemy-faction-id",
      lastUpdated: "2025-11-14T12:00:00Z",
      lastVisited: "2025-11-14T12:00:00Z"
    },
    // ... more cached points
  },
  discoveries: ["point-id-1", "point-id-2", "..."],
  lastFloorId: 1,
  lastUpdated: "2025-11-14T12:00:00Z"
}
```

Storage Key: `congress_quest_map_cache`

---

## Implementation Phases

### Phase 1: Database & Types ✅
- [x] Database migration
- [x] TypeScript types
- [x] Local storage manager

### Phase 2: API & Stores 🔨
- [ ] Supabase API functions
- [ ] Svelte stores
- [ ] Real-time subscriptions
- [ ] Visibility logic

### Phase 3: UI Components 📋
- [ ] MapView component (Leaflet integration)
- [ ] FloorSwitcher component
- [ ] PointMarker component
- [ ] PointInfoPanel component
- [ ] MapLegend component
- [ ] MiniMap component

### Phase 4: Admin Tools 📋
- [ ] Floor management UI
- [ ] Visual point position editor
- [ ] Batch import tools

### Phase 5: Testing & Polish 📋
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Accessibility improvements

---

## Database Functions

Available helper functions:

- `mark_point_discovered()` - Trigger function (auto-marks on visit)
- `get_user_discoveries(user_id)` - Get all discoveries for user
- `has_user_discovered_point(user_id, point_id)` - Check if discovered
- `get_floor_points_with_discovery(user_id, floor_id)` - Get floor points with discovery status

---

## Configuration

### Coordinate System
- X: 0 (left) to image width (right)
- Y: 0 (top) to image height (bottom)
- Unit: pixels (recommended)

### Cache Expiration
- Default: 24 hours
- Configurable per deployment
- Mini-game discoveries never expire

### Realtime Updates
- Own faction points: Real-time via Supabase
- Enemy points: Cached, manual refresh
- Player presence: Real-time via Supabase

---

## Dependencies

### Required
- `leaflet` - Map rendering library
- `@supabase/supabase-js` - Database access
- `svelte` - Component framework

### Optional
- `leaflet.markercluster` - Marker clustering for performance
- `pixi.js` - Alternative renderer for complex animations

---

## Testing

```bash
# Run unit tests
npm test src/lib/map

# Run specific test file
npm test src/lib/map/mapStorage.test.ts
```

---

## Documentation

- **Design Document:** `/documentation/concepts/2025_11_14_map.md`
- **Implementation Guide:** `/documentation/implementation/map_system_implementation.md`
- **Admin Guide:** `/documentation/guides/map_admin_quickstart.md`
- **Database Migration:** `/supabase/migrations/20251114135117_add_map_system.sql`

---

## Contributing

When adding new features:

1. Update type definitions in `map.types.ts`
2. Add corresponding tests
3. Update this README
4. Document in implementation guide

---

## Known Issues

None currently. See implementation guide for future considerations.

---

**Last Updated:** 2025-11-14  
**Maintainer:** Development Team