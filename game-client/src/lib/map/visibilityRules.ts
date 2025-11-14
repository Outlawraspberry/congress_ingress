import type {
	MapPoint,
	PointVisibilityInfo,
	CachedPointState
} from './map.types';
import { VisibilityReason } from './map.types';
import {
	isOwnFactionPoint,
	isEnemyPoint,
	isMiniGamePoint,
	isNeutralPoint
} from './map.types';

// =====================================================
// Visibility Rules Engine
// =====================================================

/**
 * Determine what information is visible to the user for a specific point
 *
 * Implements the Faction Intelligence Model:
 * - Own faction points: Always visible with real-time updates
 * - Enemy points: Always visible with cached state
 * - Unvisited points: Gray markers, no info (except own faction)
 * - Visited points: Name revealed permanently
 * - Mini-game points: Hidden until discovered
 */
export function determinePointVisibility(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean,
	cache: CachedPointState | null
): PointVisibilityInfo {
	// Mini-game points: Hidden until discovered
	if (isMiniGamePoint(point)) {
		if (!isDiscovered) {
			return {
				showLocation: false,
				showName: false,
				showDetails: false,
				showRealTime: false,
				reason: VisibilityReason.MiniGameHidden
			};
		}

		// After discovery, mini-game points are fully visible
		return {
			showLocation: true,
			showName: true,
			showDetails: true,
			showRealTime: false, // Mini-game points don't have real-time state
			reason: VisibilityReason.Visited
		};
	}

	// Own faction points: Always fully visible with real-time updates
	if (isOwnFactionPoint(point, userFactionId)) {
		return {
			showLocation: true,
			showName: true,
			showDetails: true,
			showRealTime: true,
			reason: VisibilityReason.OwnFaction
		};
	}

	// Enemy faction points: Always visible, but cached state only
	if (isEnemyPoint(point, userFactionId)) {
		if (!isDiscovered) {
			// Unvisited enemy point: Show location, but no details
			return {
				showLocation: true,
				showName: false,
				showDetails: false,
				showRealTime: false,
				reason: VisibilityReason.Undiscovered
			};
		}

		// Visited enemy point: Show name and cached state
		return {
			showLocation: true,
			showName: true,
			showDetails: cache !== null, // Only show details if we have cached data
			showRealTime: false,
			reason: VisibilityReason.EnemyCached
		};
	}

	// Neutral points (unclaimed)
	if (isNeutralPoint(point)) {
		if (!isDiscovered) {
			// Unvisited neutral point: Show location, but no details
			return {
				showLocation: true,
				showName: false,
				showDetails: false,
				showRealTime: false,
				reason: VisibilityReason.Undiscovered
			};
		}

		// Visited neutral point: Show name and details
		return {
			showLocation: true,
			showName: true,
			showDetails: true,
			showRealTime: true, // Neutral points show current state
			reason: VisibilityReason.Visited
		};
	}

	// Default: Unknown state, hide everything
	return {
		showLocation: false,
		showName: false,
		showDetails: false,
		showRealTime: false,
		reason: VisibilityReason.Undiscovered
	};
}

/**
 * Check if a point should be visible on the map at all
 */
export function shouldShowPoint(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean
): boolean {
	const visibility = determinePointVisibility(point, userFactionId, isDiscovered, null);
	return visibility.showLocation;
}

/**
 * Check if point details (health, level) should be shown
 */
export function shouldShowDetails(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean,
	cache: CachedPointState | null
): boolean {
	const visibility = determinePointVisibility(point, userFactionId, isDiscovered, cache);
	return visibility.showDetails;
}

/**
 * Check if point should show real-time updates
 */
export function shouldShowRealTime(
	point: MapPoint,
	userFactionId: string
): boolean {
	const visibility = determinePointVisibility(point, userFactionId, false, null);
	return visibility.showRealTime;
}

/**
 * Check if point name should be shown
 */
export function shouldShowName(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean
): boolean {
	const visibility = determinePointVisibility(point, userFactionId, isDiscovered, null);
	return visibility.showName;
}

// =====================================================
// Point State Resolution
// =====================================================

/**
 * Get the point state that should be displayed to the user
 * Returns either real-time state or cached state based on visibility rules
 */
export function getDisplayPointState(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean,
	cache: CachedPointState | null
): {
	health: number;
	maxHealth: number;
	level: number;
	factionId: string | null;
	isCached: boolean;
	lastUpdated?: string;
} {
	const visibility = determinePointVisibility(point, userFactionId, isDiscovered, cache);

	// If real-time updates are available, use current state
	if (visibility.showRealTime) {
		return {
			health: point.health,
			maxHealth: point.maxHealth,
			level: point.level,
			factionId: point.factionId,
			isCached: false
		};
	}

	// If we have cached data and should show details, use cache
	if (visibility.showDetails && cache !== null) {
		return {
			health: cache.health,
			maxHealth: cache.maxHealth,
			level: cache.level,
			factionId: cache.factionId,
			isCached: true,
			lastUpdated: cache.lastUpdated
		};
	}

	// Default: Return current state but mark as potentially stale
	return {
		health: point.health,
		maxHealth: point.maxHealth,
		level: point.level,
		factionId: point.factionId,
		isCached: true
	};
}

// =====================================================
// Marker Styling Helpers
// =====================================================

/**
 * Get CSS class for point marker based on visibility
 */
export function getMarkerClass(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean
): string {
	const visibility = determinePointVisibility(point, userFactionId, isDiscovered, null);

	const classes: string[] = ['map-marker'];

	// Add type class
	classes.push(`marker-${point.type}`);

	// Add visibility class
	if (!visibility.showName) {
		classes.push('marker-undiscovered');
	}

	// Add faction class
	if (isOwnFactionPoint(point, userFactionId)) {
		classes.push('marker-own-faction');
	} else if (isEnemyPoint(point, userFactionId)) {
		classes.push('marker-enemy-faction');
	} else {
		classes.push('marker-neutral');
	}

	// Add level class
	classes.push(`marker-level-${point.level}`);

	return classes.join(' ');
}

/**
 * Get opacity for point marker based on visibility and health
 */
export function getMarkerOpacity(
	point: MapPoint,
	userFactionId: string,
	isDiscovered: boolean
): number {
	const visibility = determinePointVisibility(point, userFactionId, isDiscovered, null);

	// Undiscovered points are more transparent
	if (!visibility.showName) {
		return 0.5;
	}

	// Health-based opacity for discovered points
	const healthPercent = point.maxHealth > 0 ? point.health / point.maxHealth : 1;
	return 0.7 + (healthPercent * 0.3); // Range: 0.7 to 1.0
}

/**
 * Get marker size based on point level
 */
export function getMarkerSize(level: number): number {
	const baseSize = 20; // pixels
	const sizePerLevel = 8; // pixels per level

	return baseSize + (level * sizePerLevel);
}

// =====================================================
// Filter Helpers
// =====================================================

/**
 * Filter points based on user preferences
 */
export function filterPoints(
	points: MapPoint[],
	userFactionId: string,
	discoveries: Set<string>,
	filters: {
		showOwnFaction: boolean;
		showEnemyFactions: boolean;
		showNeutral: boolean;
		showMiniGames: boolean;
		showContested: boolean;
		showUnvisited: boolean;
	}
): MapPoint[] {
	return points.filter((point) => {
		const isDiscovered = discoveries.has(point.id);

		// Mini-game filter
		if (isMiniGamePoint(point)) {
			if (!filters.showMiniGames) return false;
			// Mini-games only visible if discovered
			return isDiscovered;
		}

		// Own faction filter
		if (isOwnFactionPoint(point, userFactionId)) {
			return filters.showOwnFaction;
		}

		// Enemy faction filter
		if (isEnemyPoint(point, userFactionId)) {
			return filters.showEnemyFactions;
		}

		// Neutral filter
		if (isNeutralPoint(point)) {
			return filters.showNeutral;
		}

		// Unvisited filter
		if (!isDiscovered && !filters.showUnvisited) {
			return false;
		}

		return true;
	});
}

/**
 * Get contested points (points with low health that could change hands soon)
 */
export function getContestedPoints(
	points: MapPoint[],
	healthThreshold: number = 50
): MapPoint[] {
	return points.filter((point) => {
		if (point.factionId === null) return false; // Unclaimed points aren't "contested"
		const healthPercent = point.maxHealth > 0 ? (point.health / point.maxHealth) * 100 : 100;
		return healthPercent < healthThreshold;
	});
}

// =====================================================
// Discovery Helpers
// =====================================================

/**
 * Get all points that should be automatically discovered
 * (e.g., own faction points are always "discovered")
 */
export function getAutoDiscoveredPoints(
	points: MapPoint[],
	userFactionId: string
): string[] {
	return points
		.filter((point) => isOwnFactionPoint(point, userFactionId))
		.map((point) => point.id);
}

/**
 * Calculate exploration progress percentage
 */
export function calculateExplorationProgress(
	totalPoints: number,
	discoveredCount: number
): number {
	if (totalPoints === 0) return 0;
	return Math.round((discoveredCount / totalPoints) * 100);
}

/**
 * Get points that are visible but not yet visited (potential targets for exploration)
 */
export function getUnexploredVisiblePoints(
	points: MapPoint[],
	userFactionId: string,
	discoveries: Set<string>
): MapPoint[] {
	return points.filter((point) => {
		const isDiscovered = discoveries.has(point.id);
		const visibility = determinePointVisibility(point, userFactionId, isDiscovered, null);

		// Point is visible but not discovered (gray markers)
		return visibility.showLocation && !visibility.showName;
	});
}
