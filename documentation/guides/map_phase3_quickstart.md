# Map System Phase 3 Quick Start Guide

## Overview

Phase 3 focuses on building Svelte UI components for the map system. This guide helps you create the visual interface for the map.

**Prerequisites:**
- Phase 1 Complete: Database schema deployed
- Phase 2 Complete: API functions and stores implemented
- Floor plans uploaded and points positioned
- Leaflet.js installed (`npm install leaflet @types/leaflet`)

---

## Component Architecture

```
components/
├── MapView.svelte         # Main map container (Leaflet integration)
├── FloorSwitcher.svelte   # Floor selection dropdown/tabs
├── PointMarker.svelte     # Individual point marker
├── PointInfoPanel.svelte  # Point details sidebar/modal
├── MapLegend.svelte       # Map legend/key
└── MiniMap.svelte         # Always-visible mini-map overlay
```

---

## Component 1: MapView.svelte

**Purpose:** Main map container with Leaflet integration

**Key Features:**
- Display floor plan image
- Render point markers
- Handle zoom/pan
- Real-time updates
- Click handlers

**Basic Structure:**

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { currentFloor, visiblePoints, initializeMap, destroyMap } from '$lib/map';
  import PointMarker from './PointMarker.svelte';

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let selectedPointId: string | null = null;

  onMount(async () => {
    await initializeMap();
    
    if ($currentFloor && mapContainer) {
      // Initialize Leaflet map
      map = L.map(mapContainer, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2
      });

      // Add floor plan image
      const imageUrl = $currentFloor.map_image_url;
      const imageBounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];
      L.imageOverlay(imageUrl, imageBounds).addTo(map);
      map.fitBounds(imageBounds);
    }
  });

  onDestroy(async () => {
    if (map) {
      map.remove();
    }
    await destroyMap();
  });

  // Update floor plan when floor changes
  $: if (map && $currentFloor) {
    // Update image overlay
  }
</script>

<div class="map-container">
  <div bind:this={mapContainer} class="leaflet-map"></div>
  
  {#each $visiblePoints as point (point.id)}
    <PointMarker 
      {point} 
      isSelected={selectedPointId === point.id}
      on:click={() => selectedPointId = point.id}
    />
  {/each}
</div>

<style>
  .map-container {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  .leaflet-map {
    width: 100%;
    height: 100%;
  }
</style>
```

---

## Component 2: FloorSwitcher.svelte

**Purpose:** Floor selection UI

**Key Features:**
- List all floors
- Show current floor
- Display point counts
- Handle floor changes

**Basic Structure:**

```svelte
<script lang="ts">
  import { floors, currentFloorId, floorStats, switchFloor } from '$lib/map';

  async function handleFloorChange(floorId: number) {
    await switchFloor(floorId);
  }
</script>

<div class="floor-switcher">
  <h3>Floors</h3>
  
  {#each $floors as floor (floor.id)}
    {@const stats = $floorStats.find(s => s.floorId === floor.id)}
    
    <button
      class="floor-button"
      class:active={$currentFloorId === floor.id}
      on:click={() => handleFloorChange(floor.id)}
    >
      <span class="floor-name">{floor.name}</span>
      
      {#if stats}
        <span class="floor-stats">
          {stats.totalPoints} points
          {#if stats.ownFactionPoints > 0}
            | {stats.ownFactionPoints} yours
          {/if}
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .floor-switcher {
    position: absolute;
    top: 20px;
    left: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
  }

  .floor-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 10px;
    margin-bottom: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .floor-button:hover {
    background: #f5f5f5;
  }

  .floor-button.active {
    background: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }

  .floor-name {
    font-weight: 600;
    font-size: 14px;
  }

  .floor-stats {
    font-size: 12px;
    opacity: 0.8;
    margin-top: 4px;
  }
</style>
```

---

## Component 3: PointMarker.svelte

**Purpose:** Individual point marker on map

**Key Features:**
- Show faction color
- Size based on level
- Health indicator
- Player presence badge
- Click handler

**Props:**
- `point: MapPoint` - Point data
- `isSelected: boolean` - Selection state

**Basic Structure:**

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MapPoint } from '$lib/map';
  import { 
    getMarkerClass, 
    getMarkerOpacity, 
    getMarkerSize,
    getHealthPercentage 
  } from '$lib/map';
  import { user } from '$lib/supabase/user/user.svelte';
  import { discoveries, playerPresence } from '$lib/map';

  export let point: MapPoint;
  export let isSelected = false;

  const dispatch = createEventDispatcher();

  $: userFactionId = user.user?.faction || '';
  $: isDiscovered = $discoveries.has(point.id);
  $: markerClass = getMarkerClass(point, userFactionId, isDiscovered);
  $: opacity = getMarkerOpacity(point, userFactionId, isDiscovered);
  $: size = getMarkerSize(point.level);
  $: healthPercent = getHealthPercentage(point);
  $: presenceCount = $playerPresence.get(point.id) || 0;

  // Position on map (adjust based on your coordinate system)
  $: style = `
    left: ${point.position.x}px;
    top: ${point.position.y}px;
    width: ${size}px;
    height: ${size}px;
    opacity: ${opacity};
  `;

  function handleClick() {
    dispatch('click', { point });
  }
</script>

<button
  class={markerClass}
  class:selected={isSelected}
  {style}
  on:click={handleClick}
  title={isDiscovered ? point.name : 'Unknown'}
>
  {#if isDiscovered}
    <span class="point-name">{point.name}</span>
  {:else}
    <span class="unknown">?</span>
  {/if}

  <!-- Health bar -->
  {#if isDiscovered && point.type === 'claimable'}
    <div class="health-bar">
      <div class="health-fill" style="width: {healthPercent}%"></div>
    </div>
  {/if}

  <!-- Player presence badge -->
  {#if presenceCount > 0}
    <div class="presence-badge">{presenceCount}</div>
  {/if}
</button>

<style>
  button {
    position: absolute;
    border-radius: 50%;
    border: 2px solid #333;
    background: white;
    cursor: pointer;
    transform: translate(-50%, -50%);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
  }

  button:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 100;
  }

  button.selected {
    border-width: 4px;
    border-color: gold;
    z-index: 200;
  }

  /* Faction colors */
  .marker-own-faction {
    background: #4CAF50;
    color: white;
  }

  .marker-enemy-faction {
    background: #f44336;
    color: white;
  }

  .marker-neutral {
    background: #9E9E9E;
    color: white;
  }

  .marker-undiscovered {
    background: #E0E0E0;
    color: #666;
  }

  /* Health bar */
  .health-bar {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 3px;
    background: rgba(0,0,0,0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .health-fill {
    height: 100%;
    background: #4CAF50;
    transition: width 0.3s;
  }

  /* Presence badge */
  .presence-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #2196F3;
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
  }

  .point-name,
  .unknown {
    position: absolute;
    white-space: nowrap;
  }
</style>
```

---

## Component 4: PointInfoPanel.svelte

**Purpose:** Display point details and actions

**Key Features:**
- Point information
- Health and level display
- Cache status
- Action buttons
- Player presence

**Basic Structure:**

```svelte
<script lang="ts">
  import type { MapPoint } from '$lib/map';
  import { 
    determinePointVisibility, 
    getDisplayPointState,
    formatTimeSinceUpdate 
  } from '$lib/map';
  import { user } from '$lib/supabase/user/user.svelte';
  import { discoveries, enemyCache } from '$lib/map';

  export let point: MapPoint | null;
  export let onClose: () => void;

  $: userFactionId = user.user?.faction || '';
  $: isDiscovered = point ? $discoveries.has(point.id) : false;
  $: cache = point ? $enemyCache.get(point.id) || null : null;
  $: visibility = point 
    ? determinePointVisibility(point, userFactionId, isDiscovered, cache)
    : null;
  $: displayState = point && visibility
    ? getDisplayPointState(point, userFactionId, isDiscovered, cache)
    : null;
</script>

{#if point && visibility}
  <div class="panel">
    <div class="panel-header">
      <h2>
        {#if visibility.showName}
          {point.name}
        {:else}
          Unknown Point
        {/if}
      </h2>
      <button class="close-button" on:click={onClose}>×</button>
    </div>

    <div class="panel-content">
      <!-- Point Type -->
      <div class="info-row">
        <span class="label">Type:</span>
        <span class="value">{point.type}</span>
      </div>

      {#if visibility.showDetails && displayState}
        <!-- Level -->
        <div class="info-row">
          <span class="label">Level:</span>
          <span class="value">{displayState.level}</span>
        </div>

        <!-- Health -->
        <div class="info-row">
          <span class="label">Health:</span>
          <span class="value">
            {displayState.health} / {displayState.maxHealth}
          </span>
        </div>

        <!-- Health Bar -->
        <div class="health-bar-large">
          <div 
            class="health-fill" 
            style="width: {(displayState.health / displayState.maxHealth) * 100}%"
          ></div>
        </div>

        <!-- Cache Status -->
        {#if displayState.isCached && displayState.lastUpdated}
          <div class="cache-warning">
            ⚠️ Last updated: {formatTimeSinceUpdate(displayState.lastUpdated)}
          </div>
        {/if}

        <!-- Real-time Indicator -->
        {#if visibility.showRealTime}
          <div class="realtime-indicator">
            🟢 Real-time updates
          </div>
        {/if}
      {/if}

      <!-- Actions (if in range) -->
      {#if visibility.showDetails}
        <div class="actions">
          <button class="action-button">Navigate</button>
          <!-- Add more action buttons based on point state -->
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .panel {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 1000;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 18px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
  }

  .panel-content {
    padding: 15px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .label {
    font-weight: 600;
    color: #666;
  }

  .value {
    color: #333;
  }

  .health-bar-large {
    width: 100%;
    height: 20px;
    background: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
    margin: 15px 0;
  }

  .health-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s;
  }

  .cache-warning {
    padding: 10px;
    background: #FFF3CD;
    border: 1px solid #FFC107;
    border-radius: 4px;
    font-size: 13px;
    margin: 10px 0;
  }

  .realtime-indicator {
    padding: 8px;
    background: #E8F5E9;
    border: 1px solid #4CAF50;
    border-radius: 4px;
    font-size: 13px;
    margin: 10px 0;
  }

  .actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }

  .action-button {
    flex: 1;
    padding: 10px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .action-button:hover {
    background: #1976D2;
  }
</style>
```

---

## Component 5: MapLegend.svelte

**Purpose:** Map legend/key

**Basic Structure:**

```svelte
<script lang="ts">
  // Import faction data from your faction store
  const factions = [
    { id: '1', name: 'Red Team', color: '#f44336' },
    { id: '2', name: 'Blue Team', color: '#2196F3' },
  ];
</script>

<div class="legend">
  <h3>Legend</h3>
  
  <div class="section">
    <h4>Factions</h4>
    {#each factions as faction}
      <div class="legend-item">
        <div class="color-box" style="background: {faction.color}"></div>
        <span>{faction.name}</span>
      </div>
    {/each}
    <div class="legend-item">
      <div class="color-box" style="background: #9E9E9E"></div>
      <span>Neutral</span>
    </div>
  </div>

  <div class="section">
    <h4>Point Sizes</h4>
    <div class="legend-item">
      <div class="marker-example small"></div>
      <span>Level 1</span>
    </div>
    <div class="legend-item">
      <div class="marker-example medium"></div>
      <span>Level 2</span>
    </div>
    <div class="legend-item">
      <div class="marker-example large"></div>
      <span>Level 3</span>
    </div>
  </div>
</div>

<style>
  .legend {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    max-width: 200px;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
  }

  h4 {
    margin: 10px 0 5px 0;
    font-size: 13px;
    color: #666;
  }

  .section {
    margin-bottom: 10px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
    font-size: 13px;
  }

  .color-box {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .marker-example {
    border-radius: 50%;
    background: #4CAF50;
    border: 2px solid #333;
  }

  .marker-example.small {
    width: 20px;
    height: 20px;
  }

  .marker-example.medium {
    width: 28px;
    height: 28px;
  }

  .marker-example.large {
    width: 36px;
    height: 36px;
  }
</style>
```

---

## Integration Example

**Main Map Page:**

```svelte
<!-- routes/map/+page.svelte -->
<script lang="ts">
  import MapView from '$lib/map/components/MapView.svelte';
  import FloorSwitcher from '$lib/map/components/FloorSwitcher.svelte';
  import PointInfoPanel from '$lib/map/components/PointInfoPanel.svelte';
  import MapLegend from '$lib/map/components/MapLegend.svelte';

  let selectedPoint = null;
</script>

<div class="map-page">
  <MapView on:selectPoint={(e) => selectedPoint = e.detail} />
  <FloorSwitcher />
  <MapLegend />
  
  {#if selectedPoint}
    <PointInfoPanel 
      point={selectedPoint} 
      onClose={() => selectedPoint = null}
    />
  {/if}
</div>

<style>
  .map-page {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
```

---

## Styling Tips

1. **Use CSS Variables for Faction Colors:**
```css
:root {
  --faction-red: #f44336;
  --faction-blue: #2196F3;
  --faction-neutral: #9E9E9E;
}
```

2. **Mobile Responsive:**
```css
@media (max-width: 768px) {
  .floor-switcher {
    width: 100%;
    left: 0;
    top: auto;
    bottom: 0;
  }
}
```

3. **Animations:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.marker-contested {
  animation: pulse 2s infinite;
}
```

---

## Testing Checklist

- [ ] Map loads floor plan image correctly
- [ ] Points appear in correct positions
- [ ] Faction colors apply correctly
- [ ] Health bars update in real-time (own faction)
- [ ] Enemy points show cached state
- [ ] Unvisited points appear gray
- [ ] Mini-games hidden until discovered
- [ ] Floor switching works smoothly
- [ ] Click handlers work
- [ ] Mobile responsive
- [ ] Performance with 50+ points
- [ ] Real-time updates work
- [ ] Cache status displays correctly

---

## Performance Tips

1. **Marker Clustering** (for 100+ points):
```bash
npm install leaflet.markercluster
```

2. **Virtual Scrolling** for large point lists

3. **Lazy Loading** floor images

4. **Debounce** real-time updates

5. **Memoization** for derived values

---

## Next Steps

After Phase 3:
1. Add admin point position editor
2. Implement mini-map overlay
3. Add route planning
4. Create exploration achievements
5. Add tactical drawing tools

---

## Resources

- Leaflet Docs: https://leafletjs.com/reference.html
- Svelte Stores: https://svelte.dev/docs/svelte-store
- CSS Grid for Layout: https://css-tricks.com/snippets/css/complete-guide-grid/

---

**Phase 2 Complete!** ✅  
Ready for Phase 3: UI Components