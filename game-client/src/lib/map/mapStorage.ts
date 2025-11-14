import type { CachedPointState, MapLocalStorage } from './map.types';

// =====================================================
// Constants
// =====================================================

const STORAGE_KEYS = {
  MAP_CACHE: 'congress_quest_map_cache',
  ENEMY_CACHE: 'congress_quest_enemy_cache',
  DISCOVERIES: 'congress_quest_discoveries',
  LAST_FLOOR: 'congress_quest_last_floor',
} as const;

const STORAGE_VERSION = 1;
const DEFAULT_CACHE_EXPIRATION_HOURS = 24;

// =====================================================
// Local Storage Manager
// =====================================================

class MapStorageManager {
  /**
   * Get all map data from local storage
   */
  getMapData(): MapLocalStorage | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MAP_CACHE);
      if (!data) return null;

      const parsed: MapLocalStorage = JSON.parse(data);

      // Version check
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Map cache version mismatch, clearing cache');
        this.clearAll();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Error reading map data from localStorage:', error);
      return null;
    }
  }

  /**
   * Save all map data to local storage
   */
  saveMapData(data: Partial<MapLocalStorage>): void {
    try {
      const existing = this.getMapData() || this.getDefaultMapData();
      const updated: MapLocalStorage = {
        ...existing,
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.MAP_CACHE, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving map data to localStorage:', error);
    }
  }

  /**
   * Get default/empty map data structure
   */
  private getDefaultMapData(): MapLocalStorage {
    return {
      version: STORAGE_VERSION,
      enemyCache: {},
      discoveries: [],
      lastFloorId: null,
      lastUpdated: new Date().toISOString(),
    };
  }

  // =====================================================
  // Enemy Cache Operations
  // =====================================================

  /**
   * Get cached state for a specific enemy point
   */
  getEnemyPointCache(pointId: string): CachedPointState | null {
    const data = this.getMapData();
    if (!data) return null;

    return data.enemyCache[pointId] || null;
  }

  /**
   * Get all cached enemy points
   */
  getAllEnemyCache(): Map<string, CachedPointState> {
    const data = this.getMapData();
    if (!data) return new Map();

    return new Map(Object.entries(data.enemyCache));
  }

  /**
   * Update cache for an enemy point
   */
  updateEnemyPointCache(cache: CachedPointState): void {
    const data = this.getMapData() || this.getDefaultMapData();
    data.enemyCache[cache.pointId] = cache;
    this.saveMapData(data);
  }

  /**
   * Update multiple enemy point caches at once
   */
  updateMultipleEnemyCache(caches: CachedPointState[]): void {
    const data = this.getMapData() || this.getDefaultMapData();
    caches.forEach((cache) => {
      data.enemyCache[cache.pointId] = cache;
    });
    this.saveMapData(data);
  }

  /**
   * Remove a specific enemy point from cache
   */
  removeEnemyPointCache(pointId: string): void {
    const data = this.getMapData();
    if (!data) return;

    delete data.enemyCache[pointId];
    this.saveMapData(data);
  }

  /**
   * Clear all enemy cache
   */
  clearEnemyCache(): void {
    const data = this.getMapData();
    if (!data) return;

    data.enemyCache = {};
    this.saveMapData(data);
  }

  /**
   * Remove stale cache entries
   */
  cleanStaleCache(expirationHours: number = DEFAULT_CACHE_EXPIRATION_HOURS): void {
    const data = this.getMapData();
    if (!data) return;

    const now = new Date();
    const stalePointIds: string[] = [];

    Object.entries(data.enemyCache).forEach(([pointId, cache]) => {
      const lastUpdated = new Date(cache.lastUpdated);
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > expirationHours) {
        stalePointIds.push(pointId);
      }
    });

    stalePointIds.forEach((pointId) => {
      delete data.enemyCache[pointId];
    });

    if (stalePointIds.length > 0) {
      console.log(`Cleaned ${stalePointIds.length} stale cache entries`);
      this.saveMapData(data);
    }
  }

  /**
   * Check if a point's cache is stale
   */
  isCacheStale(
    pointId: string,
    expirationHours: number = DEFAULT_CACHE_EXPIRATION_HOURS
  ): boolean {
    const cache = this.getEnemyPointCache(pointId);
    if (!cache) return true;

    const lastUpdated = new Date(cache.lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

    return hoursDiff > expirationHours;
  }

  // =====================================================
  // Discovery Operations
  // =====================================================

  /**
   * Get all discovered point IDs
   */
  getDiscoveries(): Set<string> {
    const data = this.getMapData();
    if (!data) return new Set();

    return new Set(data.discoveries);
  }

  /**
   * Check if a point has been discovered
   */
  isPointDiscovered(pointId: string): boolean {
    const discoveries = this.getDiscoveries();
    return discoveries.has(pointId);
  }

  /**
   * Mark a point as discovered
   */
  addDiscovery(pointId: string): void {
    const data = this.getMapData() || this.getDefaultMapData();
    if (!data.discoveries.includes(pointId)) {
      data.discoveries.push(pointId);
      this.saveMapData(data);
    }
  }

  /**
   * Mark multiple points as discovered
   */
  addMultipleDiscoveries(pointIds: string[]): void {
    const data = this.getMapData() || this.getDefaultMapData();
    const existingSet = new Set(data.discoveries);

    pointIds.forEach((pointId) => {
      existingSet.add(pointId);
    });

    data.discoveries = Array.from(existingSet);
    this.saveMapData(data);
  }

  /**
   * Sync local discoveries with server
   */
  syncDiscoveries(serverDiscoveries: string[]): void {
    const localDiscoveries = this.getDiscoveries();
    const combined = new Set([...localDiscoveries, ...serverDiscoveries]);

    const data = this.getMapData() || this.getDefaultMapData();
    data.discoveries = Array.from(combined);
    this.saveMapData(data);
  }

  // =====================================================
  // Floor Operations
  // =====================================================

  /**
   * Get last visited floor ID
   */
  getLastFloorId(): number | null {
    const data = this.getMapData();
    return data?.lastFloorId || null;
  }

  /**
   * Save last visited floor ID
   */
  setLastFloorId(floorId: number): void {
    const data = this.getMapData() || this.getDefaultMapData();
    data.lastFloorId = floorId;
    this.saveMapData(data);
  }

  // =====================================================
  // Utility Operations
  // =====================================================

  /**
   * Clear all map data
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MAP_CACHE);
      // Also clear legacy keys if they exist
      localStorage.removeItem(STORAGE_KEYS.ENEMY_CACHE);
      localStorage.removeItem(STORAGE_KEYS.DISCOVERIES);
      localStorage.removeItem(STORAGE_KEYS.LAST_FLOOR);
    } catch (error) {
      console.error('Error clearing map data from localStorage:', error);
    }
  }

  /**
   * Export map data for debugging
   */
  exportData(): string {
    const data = this.getMapData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import map data (for debugging/migration)
   */
  importData(jsonString: string): boolean {
    try {
      const data: MapLocalStorage = JSON.parse(jsonString);

      // Basic validation
      if (typeof data.version !== 'number' || !Array.isArray(data.discoveries)) {
        throw new Error('Invalid map data format');
      }

      localStorage.setItem(STORAGE_KEYS.MAP_CACHE, jsonString);
      return true;
    } catch (error) {
      console.error('Error importing map data:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    totalCachedPoints: number;
    totalDiscoveries: number;
    lastUpdated: string | null;
    storageSize: number;
  } {
    const data = this.getMapData();
    if (!data) {
      return {
        totalCachedPoints: 0,
        totalDiscoveries: 0,
        lastUpdated: null,
        storageSize: 0,
      };
    }

    const jsonString = JSON.stringify(data);
    const storageSize = new Blob([jsonString]).size;

    return {
      totalCachedPoints: Object.keys(data.enemyCache).length,
      totalDiscoveries: data.discoveries.length,
      lastUpdated: data.lastUpdated,
      storageSize,
    };
  }
}

// =====================================================
// Export Singleton Instance
// =====================================================

export const mapStorage = new MapStorageManager();

// =====================================================
// Helper Functions
// =====================================================

/**
 * Create a cached point state from current point data
 */
export function createCachedState(
  pointId: string,
  health: number,
  maxHealth: number,
  level: number,
  factionId: string | null
): CachedPointState {
  const now = new Date().toISOString();
  return {
    pointId,
    health,
    maxHealth,
    level,
    factionId,
    lastUpdated: now,
    lastVisited: now,
  };
}

/**
 * Format time since last update
 */
export function formatTimeSinceUpdate(lastUpdated: string): string {
  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffMs = now.getTime() - updated.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
