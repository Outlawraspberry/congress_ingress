/**
 * Map System Module
 *
 * Provides floor-based navigation, point positioning, fog-of-war mechanics,
 * and faction intelligence features for Congress Quest.
 *
 * @module map
 */

// =====================================================
// Types
// =====================================================

export type {
  // Database types
  Floor,
  PointPosition,
  PointDiscovery,
  Point,

  // Display types
  MapPoint,
  CachedPointState,
  FloorWithPoints,
  PointPlayerPresence,

  // Visibility system
  PointVisibilityInfo,

  // State management
  MapState,
  MapConfig,
  MapAction,
  MapEventHandlers,

  // UI component props
  PointMarkerProps,
  FloorSwitcherProps,
  PointInfoPanelProps,
  MapLegendProps,

  // Local storage
  MapLocalStorage,

  // API types
  LoadFloorRequest,
  LoadFloorResponse,
  UpdateCacheRequest,

  // Utility types
  Coordinates,
  BoundingBox,
  ZoomConfig,
  MapFilters,
} from './map.types';

export { VisibilityReason } from './map.types';

// =====================================================
// Type Guards and Helpers
// =====================================================

export {
  isClaimablePoint,
  isMiniGamePoint,
  isOwnFactionPoint,
  isEnemyPoint,
  isNeutralPoint,
  isCacheStale,
  getHealthPercentage,
  getPointStatus,
} from './map.types';

// =====================================================
// Storage Manager
// =====================================================

export { mapStorage } from './mapStorage';

export {
  createCachedState,
  formatTimeSinceUpdate,
} from './mapStorage';

// =====================================================
// Constants
// =====================================================

/**
 * Default cache expiration time in hours
 */
export const DEFAULT_CACHE_EXPIRATION_HOURS = 24;

/**
 * Storage version for cache compatibility
 */
export const STORAGE_VERSION = 1;

/**
 * Map configuration defaults
 */
export const DEFAULT_MAP_CONFIG: import('./map.types').MapConfig = {
  enableFogOfWar: true,
  enableEnemyCache: true,
  cacheExpirationHours: DEFAULT_CACHE_EXPIRATION_HOURS,
  showPlayerPresence: true,
  enableMiniMap: true,
};

// =====================================================
// Future Exports (will be added in Phase 2+)
// =====================================================

// export { mapStore } from './mapStore';
// export { visibilityRules } from './visibilityRules';
// export { mapApi } from './mapApi';
//
// export { default as MapView } from './components/MapView.svelte';
// export { default as FloorSwitcher } from './components/FloorSwitcher.svelte';
// export { default as PointMarker } from './components/PointMarker.svelte';
// export { default as PointInfoPanel } from './components/PointInfoPanel.svelte';
// export { default as MapLegend } from './components/MapLegend.svelte';
// export { default as MiniMap } from './components/MiniMap.svelte';
