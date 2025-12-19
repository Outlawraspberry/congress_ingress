import { writable, derived, get } from 'svelte/store';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Floor, MapPoint, MapConfig, CachedPointState } from './map.types';
import { mapStorage, createCachedState } from './mapStorage';
import {
	loadFloors,
	loadFloorPoints,
	loadUserDiscoveries,
	loadFloorPlayerPresence,
	subscribeToFactionPoints,
	subscribeToDiscoveries,
	subscribeToPlayerPresence,
	unsubscribe
} from './mapApi';
import { determinePointVisibility, filterPoints } from './visibilityRules';
import { user } from '../supabase/user/user.svelte';
import { PUBLIC_TILE_SERVER_URL } from '$env/static/public';

// =====================================================
// Configuration Store
// =====================================================

export const mapConfig = writable<MapConfig>({
	enableFogOfWar: true,
	enableEnemyCache: true,
	cacheExpirationHours: 24,
	showPlayerPresence: true,
	enableMiniMap: true,
	// Tileserver configuration (disabled by default - use image overlay mode)
	useTileServer: true,
	tileServerUrl: PUBLIC_TILE_SERVER_URL // e.g., 'http://localhost:8080/tiles'
});

// =====================================================
// Core State Stores
// =====================================================

/**
 * All available floors
 */
export const floors = writable<Floor[]>([]);

/**
 * Currently selected floor ID
 */
export const currentFloorId = writable<number | null>(null);

/**
 * All points across all floors
 */
export const allPoints = writable<Map<string, MapPoint>>(new Map());

/**
 * Points on the current floor
 */
export const currentFloorPoints = derived(
	[allPoints, currentFloorId],
	([$allPoints, $currentFloorId]) => {
		if ($currentFloorId === null) return [];

		return Array.from($allPoints.values()).filter(
			(point) => point.position.floorId === $currentFloorId
		);
	}
);

/**
 * User's discovered point IDs
 */
export const discoveries = writable<Set<string>>(new Set());

/**
 * Enemy point cache
 */
export const enemyCache = writable<Map<string, CachedPointState>>(new Map());

/**
 * Player presence at points (pointId -> count)
 */
export const playerPresence = writable<Map<string, number>>(new Map());

/**
 * Loading state (for initial load)
 */
export const isLoading = writable<boolean>(false);

/**
 * Loading state for floor switching (doesn't show full overlay)
 */
export const isSwitchingFloor = writable<boolean>(false);

/**
 * Error state
 */
export const error = writable<string | null>(null);

// =====================================================
// Derived Stores
// =====================================================

/**
 * Visible points on current floor based on visibility rules
 */
export const visiblePoints = derived(
	[currentFloorPoints, discoveries, enemyCache],
	([$currentFloorPoints, $discoveries, $enemyCache]) => {
		if (!user.user) return [];

		const userFactionId = user.user.faction;

		return $currentFloorPoints
			.map((point) => {
				const isDiscovered = $discoveries.has(point.id);
				const cache = $enemyCache.get(point.id) || null;
				const visibility = determinePointVisibility(point, userFactionId, isDiscovered, cache);

				// Update point's isVisible flag
				return {
					...point,
					isVisible: visibility.showLocation
				};
			})
			.filter((point) => point.isVisible);
	}
);

/**
 * Current floor object
 */
export const currentFloor = derived([floors, currentFloorId], ([$floors, $currentFloorId]) => {
	if ($currentFloorId === null) return null;
	return $floors.find((f) => f.id === $currentFloorId) || null;
});

/**
 * Floor statistics (point count, faction control, etc.)
 */
export const floorStats = derived([floors, allPoints], ([$floors, $allPoints]) => {
	if (!user.user) return [];

	const userFactionId = user.user.faction;

	return $floors.map((floor) => {
		const floorPoints = Array.from($allPoints.values()).filter(
			(p) => p.position.floorId === floor.id
		);

		const totalPoints = floorPoints.length;
		const ownFactionPoints = floorPoints.filter((p) => p.factionId === userFactionId).length;
		const enemyPoints = floorPoints.filter(
			(p) => p.factionId !== null && p.factionId !== userFactionId
		).length;
		const neutralPoints = floorPoints.filter((p) => p.factionId === null).length;

		return {
			floorId: floor.id,
			floorName: floor.name,
			totalPoints,
			ownFactionPoints,
			enemyPoints,
			neutralPoints
		};
	});
});

// =====================================================
// Real-time Subscriptions
// =====================================================

let factionPointsChannel: RealtimeChannel | null = null;
let discoveriesChannel: RealtimeChannel | null = null;
let playerPresenceChannel: RealtimeChannel | null = null;

// =====================================================
// Actions
// =====================================================

/**
 * Initialize the map system
 */
export async function initializeMap(): Promise<void> {
	if (!user.user) {
		error.set('User not authenticated');
		return;
	}

	isLoading.set(true);
	error.set(null);

	try {
		// Load floors
		const floorsData = await loadFloors();
		floors.set(floorsData);

		// Load discoveries from server
		const userDiscoveries = await loadUserDiscoveries(user.user.id);
		const discoveryIds = new Set(userDiscoveries.map((d) => d.point_id));
		discoveries.set(discoveryIds);

		// Sync with local storage
		const localDiscoveries = mapStorage.getDiscoveries();
		const combinedDiscoveries = new Set([...discoveryIds, ...localDiscoveries]);
		discoveries.set(combinedDiscoveries);
		mapStorage.syncDiscoveries(Array.from(combinedDiscoveries));

		// Load enemy cache from local storage
		const cachedEnemyStates = mapStorage.getAllEnemyCache();
		enemyCache.set(cachedEnemyStates);

		// Clean stale cache
		const config = get(mapConfig);
		mapStorage.cleanStaleCache(config.cacheExpirationHours);

		// Set last floor or default to first
		const lastFloorId = mapStorage.getLastFloorId();
		if (lastFloorId && floorsData.find((f) => f.id === lastFloorId)) {
			currentFloorId.set(lastFloorId);
		} else if (floorsData.length > 0) {
			currentFloorId.set(floorsData[0].id);
		}

		// Load current floor if set
		const currentId = get(currentFloorId);
		if (currentId !== null) {
			await loadFloor(currentId, true);
		}

		// Subscribe to real-time updates
		subscribeToUpdates();
	} catch (err) {
		console.error('Error initializing map:', err);
		error.set(err instanceof Error ? err.message : 'Failed to initialize map');
	} finally {
		isLoading.set(false);
	}
}

/**
 * Load a specific floor's data
 */
export async function loadFloor(floorId: number, isInitialLoad: boolean = false): Promise<void> {
	if (!user.user) return;

	if (isInitialLoad) {
		isLoading.set(true);
	} else {
		isSwitchingFloor.set(true);
	}
	error.set(null);

	try {
		// Load points with discovery status
		const { points } = await loadFloorPoints(floorId, user.user.id);

		// Update points map
		const pointsMap = get(allPoints);
		points.forEach((point) => {
			pointsMap.set(point.id, point);
		});
		allPoints.set(pointsMap);

		// Load player presence if enabled
		const config = get(mapConfig);
		if (config.showPlayerPresence) {
			const presence = await loadFloorPlayerPresence(floorId, user.user.faction);
			playerPresence.set(presence);
		}

		// Update current floor
		currentFloorId.set(floorId);
		mapStorage.setLastFloorId(floorId);
	} catch (err) {
		console.error('Error loading floor:', err);
		error.set(err instanceof Error ? err.message : 'Failed to load floor');
	} finally {
		if (isInitialLoad) {
			isLoading.set(false);
		} else {
			isSwitchingFloor.set(false);
		}
	}
}

/**
 * Switch to a different floor
 */
export async function switchFloor(floorId: number): Promise<void> {
	await loadFloor(floorId);
}

/**
 * Mark a point as discovered (usually called when user scans QR code)
 */
export function discoverPoint(pointId: string): void {
	const discoverySet = get(discoveries);
	discoverySet.add(pointId);
	discoveries.set(discoverySet);

	// Save to local storage
	mapStorage.addDiscovery(pointId);
}

/**
 * Update enemy point cache after visiting
 */
export function updateEnemyCache(point: MapPoint): void {
	const cache = createCachedState(
		point.id,
		point.health,
		point.maxHealth,
		point.level,
		point.factionId
	);

	// Update store
	const cacheMap = get(enemyCache);
	cacheMap.set(point.id, cache);
	enemyCache.set(cacheMap);

	// Save to local storage
	mapStorage.updateEnemyPointCache(cache);
}

/**
 * Update a point's data (from real-time subscription)
 */
export function updatePoint(pointId: string, updates: Partial<MapPoint>): void {
	const pointsMap = get(allPoints);
	const existingPoint = pointsMap.get(pointId);

	if (existingPoint) {
		const updatedPoint = { ...existingPoint, ...updates };
		pointsMap.set(pointId, updatedPoint);
		allPoints.set(pointsMap);

		// If it's an enemy point and we have it cached, update cache
		if (
			user.user &&
			existingPoint.factionId !== user.user.faction &&
			existingPoint.factionId !== null
		) {
			updateEnemyCache(updatedPoint);
		}
	}
}

/**
 * Subscribe to real-time updates
 */
function subscribeToUpdates(): void {
	if (!user.user) return;

	// Unsubscribe from existing channels
	cleanupSubscriptions();

	// Subscribe to own faction's points
	factionPointsChannel = subscribeToFactionPoints(user.user.faction, (point) => {
		updatePoint(point.id, {
			health: point.health,
			maxHealth: point.max_health,
			level: point.level,
			factionId: point.acquired_by
		});
	});

	// Subscribe to discoveries
	discoveriesChannel = subscribeToDiscoveries(user.user.id, (discovery) => {
		discoverPoint(discovery.point_id);
	});

	// Subscribe to player presence
	const currentId = get(currentFloorId);
	if (currentId !== null) {
		const points = get(currentFloorPoints);
		const pointIds = points.map((p) => p.id);

		playerPresenceChannel = subscribeToPlayerPresence(pointIds, async () => {
			// Reload presence for this point
			const config = get(mapConfig);
			if (config.showPlayerPresence && user.user) {
				const presence = await loadFloorPlayerPresence(currentId, user.user.faction);
				playerPresence.set(presence);
			}
		});
	}
}

/**
 * Cleanup subscriptions
 */
async function cleanupSubscriptions(): Promise<void> {
	if (factionPointsChannel) {
		await unsubscribe(factionPointsChannel);
		factionPointsChannel = null;
	}

	if (discoveriesChannel) {
		await unsubscribe(discoveriesChannel);
		discoveriesChannel = null;
	}

	if (playerPresenceChannel) {
		await unsubscribe(playerPresenceChannel);
		playerPresenceChannel = null;
	}
}

/**
 * Destroy the map system (cleanup)
 */
export async function destroyMap(): Promise<void> {
	await cleanupSubscriptions();

	// Reset stores
	floors.set([]);
	currentFloorId.set(null);
	allPoints.set(new Map());
	discoveries.set(new Set());
	enemyCache.set(new Map());
	playerPresence.set(new Map());
	isLoading.set(false);
	error.set(null);
}

/**
 * Refresh current floor data
 */
export async function refreshCurrentFloor(): Promise<void> {
	const currentId = get(currentFloorId);
	if (currentId !== null) {
		await loadFloor(currentId);
	}
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
	mapStorage.clearAll();
	enemyCache.set(new Map());
	discoveries.set(new Set());
}

// =====================================================
// Filter Actions
// =====================================================

/**
 * Apply filters to visible points
 */
export const filteredPoints = derived(
	[visiblePoints, discoveries, mapConfig],
	([$visiblePoints, $discoveries]) => {
		if (!user.user) return [];

		// Default filters (all enabled)
		const filters = {
			showOwnFaction: true,
			showEnemyFactions: true,
			showNeutral: true,
			showMiniGames: true,
			showContested: true,
			showUnvisited: true
		};

		return filterPoints($visiblePoints, user.user.faction, $discoveries, filters);
	}
);
