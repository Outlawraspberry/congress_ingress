import { supabase } from './db.svelte';
// import type { Database } from '../../types/database.types';

export interface ScoreboardUser {
	user_id: string;
	username: string;
	experience: number;
	faction_id: string | null;
	faction_name: string | null;
	last_action: string | null;
}

export interface PointOverview {
	point_id: string;
	point_name: string;
	current_health: number;
	max_health: number;
	current_faction_id: string | null;
	current_faction_name: string | null;
	current_claim_duration: unknown;
	total_claims_count: number;
}

export interface PointHistory {
	created_at: string;
	faction_id: string | null;
	fk;
	faction_name: string;
	health: number;
	duration_held: unknown;
}

export interface FactionStatistics {
	faction_id: string;
	faction_name: string;
	total_members: number;
	total_experience: number;
	average_experience: number;
	points_controlled: number;
	total_historical_claims: number;
}

export class ScoreboardService {
	/**
	 * Get top users by experience for the global scoreboard
	 */
	static async getTopUsersByExperience(limit: number = 10): Promise<ScoreboardUser[]> {
		const { data, error } = await supabase.rpc('get_top_users_by_experience', {
			limit_count: limit
		});

		if (error) {
			console.error('Error fetching top users by experience:', error);
			throw error;
		}

		return data || [];
	}

	/**
	 * Get overview of all points with current ownership and statistics
	 */
	static async getPointsOverview(): Promise<PointOverview[]> {
		const { data, error } = await supabase.rpc('get_points_overview');

		if (error) {
			console.error('Error fetching points overview:', error);
			throw error;
		}

		return data || [];
	}

	/**
	 * Get detailed history for a specific point
	 */
	static async getPointHistory(pointId: string): Promise<PointHistory[]> {
		const { data, error } = await supabase.rpc('get_point_history', {
			target_point_id: pointId
		});

		if (error) {
			console.error('Error fetching point history:', error);
			throw error;
		}

		return data || [];
	}

	/**
	 * Get statistics for all factions
	 */
	static async getFactionStatistics(): Promise<FactionStatistics[]> {
		const { data, error } = await supabase.rpc('get_faction_statistics');

		if (error) {
			console.error('Error fetching faction statistics:', error);
			throw error;
		}

		return data || [];
	}

	/**
	 * Subscribe to real-time updates for user experience changes
	 */
	static subscribeToExperienceUpdates(callback: (payload: unknown) => void) {
		return supabase
			.channel('user-experience-updates')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'user_game_data',
					filter: 'experience=neq.prev(experience)'
				},
				callback
			)
			.subscribe();
	}

	/**
	 * Subscribe to real-time updates for point ownership changes
	 */
	static subscribeToPointUpdates(callback: (payload: unknown) => void) {
		return supabase
			.channel('point-ownership-updates')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'point',
					filter: 'acquired_by=neq.prev(acquired_by)'
				},
				callback
			)
			.subscribe();
	}
}
