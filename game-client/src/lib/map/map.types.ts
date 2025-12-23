import type { Tables } from '../../types/database.types';

// =====================================================
// Database Table Types
// =====================================================

export type Floor = Tables<'floors'>;
export type PointPosition = Tables<'point_positions'>;
export type PointDiscovery = Tables<'point_discoveries'>;
export type Point = Tables<'point'>;

// =====================================================
// Map Display Types
// =====================================================

export interface MapPointPosition {
	x: number;
	y: number;
	floorId: number;
}

/**
 * Point with its position and discovery status
 */
export interface MapPoint<POSITION extends MapPointPosition | null = MapPointPosition> {
	id: string;
	name: string;
	type: 'claimable' | 'not_claimable' | 'mini_game';
	level: number;
	health: number;
	maxHealth: number;
	factionId: string | null;
	position: POSITION;
	isDiscovered: boolean;
	isVisible: boolean; // Based on fog-of-war rules
}

/**
 * Cached state of an enemy point (last known)
 */
export interface CachedPointState {
	pointId: string;
	health: number;
	maxHealth: number;
	level: number;
	factionId: string | null;
	lastUpdated: string; // ISO timestamp
	lastVisited: string; // ISO timestamp
}

/**
 * Floor with all its points
 */
export interface FloorWithPoints extends Floor {
	points: MapPoint[];
	playerCount?: number; // Number of faction members on this floor
}

/**
 * Player presence at a point
 */
export interface PointPlayerPresence {
	pointId: string;
	playerCount: number;
	playerIds: string[];
}

// =====================================================
// Visibility Rules
// =====================================================

/**
 * Determines what information is visible to the user
 */
export interface PointVisibilityInfo {
	showLocation: boolean; // Show on map
	showName: boolean; // Show point name
	showDetails: boolean; // Show health, level, etc.
	showRealTime: boolean; // Show real-time updates
	reason: VisibilityReason;
}

export enum VisibilityReason {
	OwnFaction = 'own_faction',
	Visited = 'visited',
	EnemyCached = 'enemy_cached',
	Undiscovered = 'undiscovered',
	MiniGameHidden = 'mini_game_hidden'
}

// =====================================================
// Map State Management
// =====================================================

/**
 * Main map state
 */
export interface MapState {
	floors: Floor[];
	currentFloorId: number | null;
	points: Map<string, MapPoint>;
	discoveries: Set<string>; // Set of discovered point IDs
	enemyCache: Map<string, CachedPointState>;
	playerPresence: Map<string, PointPlayerPresence>;
	isLoading: boolean;
	error: string | null;
}

/**
 * Map configuration
 */
export interface MapConfig {
	enableFogOfWar: boolean;
	enableEnemyCache: boolean;
	cacheExpirationHours: number;
	showPlayerPresence: boolean;
	enableMiniMap: boolean;
	// Tileserver configuration (optional)
	useTileServer?: boolean;
	tileServerUrl?: string;
}

// =====================================================
// Map Actions & Events
// =====================================================

/**
 * Actions that can be performed on the map
 */
export type MapAction =
	| { type: 'SET_FLOOR'; floorId: number }
	| { type: 'UPDATE_POINT'; point: MapPoint }
	| { type: 'DISCOVER_POINT'; pointId: string }
	| { type: 'UPDATE_ENEMY_CACHE'; cache: CachedPointState }
	| { type: 'UPDATE_PLAYER_PRESENCE'; presence: PointPlayerPresence }
	| { type: 'SET_LOADING'; isLoading: boolean }
	| { type: 'SET_ERROR'; error: string | null };

/**
 * Map event types for real-time updates
 */
export interface MapEventHandlers {
	onPointUpdate?: (point: MapPoint) => void;
	onPointDiscovered?: (pointId: string) => void;
	onPlayerPresenceUpdate?: (presence: PointPlayerPresence) => void;
	onFloorChange?: (floorId: number) => void;
}

// =====================================================
// UI Component Props
// =====================================================

/**
 * Props for point marker component
 */
export interface PointMarkerProps {
	point: MapPoint;
	isSelected: boolean;
	onClick?: () => void;
	factionColor?: string;
}

/**
 * Props for floor switcher component
 */
export interface FloorSwitcherProps {
	floors: Floor[];
	currentFloorId: number | null;
	onFloorChange: (floorId: number) => void;
}

/**
 * Props for point info panel
 */
export interface PointInfoPanelProps {
	point: MapPoint | null;
	visibility: PointVisibilityInfo;
	playerPresence?: PointPlayerPresence;
	cachedState?: CachedPointState;
	onClose: () => void;
	onNavigate?: () => void;
	onAction?: (actionType: string) => void;
}

/**
 * Props for map legend component
 */
export interface MapLegendProps {
	factions: Array<{ id: string; name: string; color: string }>;
	showPointTypes?: boolean;
	showLevelIndicators?: boolean;
}

// =====================================================
// Local Storage Schema
// =====================================================

/**
 * Structure for local storage cache
 */
export interface MapLocalStorage {
	version: number;
	enemyCache: Record<string, CachedPointState>;
	discoveries: string[];
	lastFloorId: number | null;
	lastUpdated: string;
}

// =====================================================
// API Request/Response Types
// =====================================================

/**
 * Request to load floor data
 */
export interface LoadFloorRequest {
	floorId: number;
	userId: string;
}

/**
 * Response with floor and points data
 */
export interface LoadFloorResponse {
	floor: Floor;
	points: MapPoint[];
	discoveries: string[];
}

/**
 * Request to update enemy cache after visit
 */
export interface UpdateCacheRequest {
	pointId: string;
	observedState: {
		health: number;
		level: number;
		factionId: string | null;
	};
}

// =====================================================
// Utility Types
// =====================================================

/**
 * Coordinates on the floor map
 */
export interface Coordinates {
	x: number;
	y: number;
}

/**
 * Bounding box for map viewport
 */
export interface BoundingBox {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/**
 * Map zoom level configuration
 */
export interface ZoomConfig {
	min: number;
	max: number;
	default: number;
}

/**
 * Filter options for map display
 */
export interface MapFilters {
	showOwnFaction: boolean;
	showEnemyFactions: boolean;
	showNeutral: boolean;
	showMiniGames: boolean;
	showContested: boolean;
	showUnvisited: boolean;
}

// =====================================================
// Helper Type Guards
// =====================================================

export function isClaimablePoint(point: MapPoint): boolean {
	return point.type === 'claimable';
}

export function isMiniGamePoint(point: MapPoint): boolean {
	return point.type === 'mini_game';
}

export function isOwnFactionPoint(point: MapPoint, userFactionId: string): boolean {
	return point.factionId === userFactionId;
}

export function isEnemyPoint(point: MapPoint, userFactionId: string): boolean {
	return point.factionId !== null && point.factionId !== userFactionId;
}

export function isNeutralPoint(point: MapPoint): boolean {
	return point.factionId === null;
}

/**
 * Check if cached data is stale
 */
export function isCacheStale(cache: CachedPointState, expirationHours: number): boolean {
	const lastUpdated = new Date(cache.lastUpdated);
	const now = new Date();
	const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
	return hoursDiff > expirationHours;
}

/**
 * Calculate health percentage
 */
export function getHealthPercentage(point: MapPoint): number {
	return point.maxHealth > 0 ? (point.health / point.maxHealth) * 100 : 0;
}

/**
 * Get point status description
 */
export function getPointStatus(point: MapPoint): string {
	const healthPercent = getHealthPercentage(point);
	if (healthPercent === 100) return 'Healthy';
	if (healthPercent >= 80) return 'Good';
	if (healthPercent >= 20) return 'Damaged';
	if (healthPercent >= 1) return 'Critical';
	return 'Destroyed';
}
