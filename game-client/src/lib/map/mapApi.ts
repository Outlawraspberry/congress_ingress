import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/db.svelte';
import type {
	Floor,
	PointPosition,
	MapPoint,
	PointDiscovery,
	LoadFloorResponse
} from './map.types';
import type { Tables } from '../../types/database.types';

// =====================================================
// Floor API Functions
// =====================================================

/**
 * Load all active floors
 */
export async function loadFloors(): Promise<Floor[]> {
	const { data, error } = await supabase
		.from('floors')
		.select('*')
		.eq('is_active', true)
		.order('display_order', { ascending: true });

	if (error) {
		console.error('Error loading floors:', error);
		throw error;
	}

	return data || [];
}

/**
 * Load a specific floor by ID
 */
export async function loadFloor(floorId: number): Promise<Floor | null> {
	const { data, error } = await supabase.from('floors').select('*').eq('id', floorId).single();

	if (error) {
		console.error('Error loading floor:', error);
		throw error;
	}

	return data;
}

// =====================================================
// Point Position API Functions
// =====================================================

/**
 * Load all point positions for a specific floor
 */
export async function loadPointPositions(floorId: number): Promise<PointPosition[]> {
	const { data, error } = await supabase
		.from('point_positions')
		.select('*')
		.eq('floor_id', floorId);

	if (error) {
		console.error('Error loading point positions:', error);
		throw error;
	}

	return data || [];
}

/**
 * Load points with their positions and discovery status for a floor
 */
export async function loadFloorPoints(floorId: number, userId: string): Promise<LoadFloorResponse> {
	// Load floor data
	const floor = await loadFloor(floorId);
	if (!floor) {
		throw new Error(`Floor ${floorId} not found`);
	}

	// Use the database function to get points with discovery status
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data, error } = (await supabase.rpc('get_floor_points_with_discovery' as any, {
		p_user_id: userId,
		p_floor_id: floorId
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	})) as { data: any[] | null; error: any };

	if (error) {
		console.error('Error loading floor points:', error);
		throw error;
	}

	// Transform to MapPoint format
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const points: MapPoint[] = (data || []).map((p: any) => ({
		id: p.point_id,
		name: p.point_name,
		type: p.point_type,
		level: p.point_level,
		health: p.point_health,
		maxHealth: p.point_max_health,
		factionId: p.faction_id,
		position: {
			x: Number(p.x_coordinate),
			y: Number(p.y_coordinate),
			floorId: floorId
		},
		isDiscovered: p.is_discovered,
		isVisible: true // Will be determined by visibility rules
	}));

	// Get user's discoveries for this floor
	const discoveries = points.filter((p) => p.isDiscovered).map((p) => p.id);

	return {
		floor,
		points,
		discoveries
	};
}

/**
 * Load all points across all floors (for admin or overview)
 */
export async function loadAllPoints(userId: string): Promise<MapPoint[]> {
	const floors = await loadFloors();
	const allPoints: MapPoint[] = [];

	for (const floor of floors) {
		const { points } = await loadFloorPoints(floor.id, userId);
		allPoints.push(...points);
	}

	return allPoints;
}

// =====================================================
// Discovery API Functions
// =====================================================

/**
 * Load all discoveries for a user
 */
export async function loadUserDiscoveries(userId: string): Promise<PointDiscovery[]> {
	const { data, error } = await supabase
		.from('point_discoveries')
		.select('*')
		.eq('user_id', userId)
		.order('discovered_at', { ascending: false });

	if (error) {
		console.error('Error loading discoveries:', error);
		throw error;
	}

	return data || [];
}

/**
 * Check if a user has discovered a specific point
 */
export async function hasUserDiscoveredPoint(userId: string, pointId: string): Promise<boolean> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data, error } = (await supabase.rpc('has_user_discovered_point' as any, {
		p_user_id: userId,
		p_point_id: pointId
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	})) as { data: boolean | null; error: any };

	if (error) {
		console.error('Error checking discovery:', error);
		return false;
	}

	return data || false;
}

/**
 * Manually mark a point as discovered (normally handled by trigger)
 */
export async function markPointDiscovered(userId: string, pointId: string): Promise<void> {
	const { error } = await supabase.from('point_discoveries').insert({
		user_id: userId,
		point_id: pointId
	});

	if (error && error.code !== '23505') {
		// Ignore duplicate key errors
		console.error('Error marking point discovered:', error);
		throw error;
	}
}

// =====================================================
// Player Presence API Functions
// =====================================================

/**
 * Load player presence at all points on a floor
 */
export async function loadFloorPlayerPresence(
	floorId: number,
	factionId: string
): Promise<Map<string, number>> {
	// Get all point positions for this floor
	const positions = await loadPointPositions(floorId);
	const pointIds = positions.map((p) => p.point_id);

	if (pointIds.length === 0) {
		return new Map();
	}

	// Count players at each point (from same faction)
	const { data, error } = await supabase
		.from('point_user')
		.select('point_id, user_id')
		.in('point_id', pointIds);

	if (error) {
		console.error('Error loading player presence:', error);
		return new Map();
	}

	// Filter by faction and count
	const presence = new Map<string, number>();

	for (const pointId of pointIds) {
		const playersAtPoint = data?.filter((pu) => pu.point_id === pointId) || [];

		// Get faction for each player
		const playerFactions = await Promise.all(
			playersAtPoint.map(async (pu) => {
				const { data: userData } = await supabase
					.from('user_game_data')
					.select('faction_id')
					.eq('user_id', pu.user_id)
					.single();
				return userData?.faction_id;
			})
		);

		// Count only same faction
		const count = playerFactions.filter((f) => f === factionId).length;
		if (count > 0) {
			presence.set(pointId, count);
		}
	}

	return presence;
}

/**
 * Load player presence at a specific point
 */
export async function loadPointPlayerPresence(pointId: string, factionId: string): Promise<number> {
	const { data, error } = await supabase
		.from('point_user')
		.select('user_id')
		.eq('point_id', pointId);

	if (error) {
		console.error('Error loading point player presence:', error);
		return 0;
	}

	if (!data || data.length === 0) {
		return 0;
	}

	// Filter by faction
	const playerFactions = await Promise.all(
		data.map(async (pu) => {
			const { data: userData } = await supabase
				.from('user_game_data')
				.select('faction_id')
				.eq('user_id', pu.user_id)
				.single();
			return userData?.faction_id;
		})
	);

	return playerFactions.filter((f) => f === factionId).length;
}

// =====================================================
// Real-time Subscriptions
// =====================================================

/**
 * Subscribe to point updates for a specific faction (real-time for own faction)
 */
export function subscribeToFactionPoints(
	factionId: string,
	onUpdate: (point: Tables<'point'>) => void
): RealtimeChannel {
	const channel = supabase
		.channel('faction-points')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'point',
				filter: `acquired_by=eq.${factionId}`
			},
			(payload) => {
				if (payload.new) {
					onUpdate(payload.new as Tables<'point'>);
				}
			}
		)
		.subscribe();

	return channel;
}

/**
 * Subscribe to point discoveries for a user
 */
export function subscribeToDiscoveries(
	userId: string,
	onDiscovery: (discovery: PointDiscovery) => void
): RealtimeChannel {
	const channel = supabase
		.channel('user-discoveries')
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'point_discoveries',
				filter: `user_id=eq.${userId}`
			},
			(payload) => {
				if (payload.new) {
					onDiscovery(payload.new as PointDiscovery);
				}
			}
		)
		.subscribe();

	return channel;
}

/**
 * Subscribe to player presence changes on a floor
 */
export function subscribeToPlayerPresence(
	pointIds: string[],
	onPresenceChange: (pointId: string) => void
): RealtimeChannel {
	const channel = supabase
		.channel('player-presence')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'point_user'
			},
			(payload) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const pointId = (payload.new as any)?.point_id || (payload.old as any)?.point_id;
				if (pointId && pointIds.includes(pointId)) {
					onPresenceChange(pointId);
				}
			}
		)
		.subscribe();

	return channel;
}

/**
 * Subscribe to all point updates (for contested points, attacks, etc.)
 */
export function subscribeToAllPoints(onUpdate: (point: Tables<'point'>) => void): RealtimeChannel {
	const channel = supabase
		.channel('all-points')
		.on(
			'postgres_changes',
			{
				event: 'UPDATE',
				schema: 'public',
				table: 'point'
			},
			(payload) => {
				if (payload.new) {
					onUpdate(payload.new as Tables<'point'>);
				}
			}
		)
		.subscribe();

	return channel;
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
	await supabase.removeChannel(channel);
}

// =====================================================
// Admin API Functions (for future admin tools)
// =====================================================

/**
 * Create a new floor (admin only)
 */
export async function createFloor(floor: {
	name: string;
	building_name?: string;
	map_image_url: string;
	display_order: number;
}): Promise<Floor> {
	const { data, error } = await supabase.from('floors').insert(floor).select().single();

	if (error) {
		console.error('Error creating floor:', error);
		throw error;
	}

	return data;
}

/**
 * Update a floor (admin only)
 */
export async function updateFloor(floorId: number, updates: Partial<Floor>): Promise<Floor> {
	const { data, error } = await supabase
		.from('floors')
		.update(updates)
		.eq('id', floorId)
		.select()
		.single();

	if (error) {
		console.error('Error updating floor:', error);
		throw error;
	}

	return data;
}

/**
 * Create or update a point position (admin only)
 */
export async function upsertPointPosition(position: {
	point_id: string;
	floor_id: number;
	x_coordinate: number;
	y_coordinate: number;
}): Promise<PointPosition> {
	const { data, error } = await supabase
		.from('point_positions')
		.upsert(position, { onConflict: 'point_id' })
		.select()
		.single();

	if (error) {
		console.error('Error upserting point position:', error);
		throw error;
	}

	return data;
}

/**
 * Delete a point position (admin only)
 */
export async function deletePointPosition(pointId: string): Promise<void> {
	const { error } = await supabase.from('point_positions').delete().eq('point_id', pointId);

	if (error) {
		console.error('Error deleting point position:', error);
		throw error;
	}
}
