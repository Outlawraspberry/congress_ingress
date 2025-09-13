import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Point } from '../../../types/alias';
import { supabase } from '../db.svelte';

const nameCache = new Map<string, string>();

export class PointState {
	state: {
		point: Point | null;
		mappingid: string | null;
	} = $state({
		point: null,
		mappingid: null
	});

	private pointId: string;
	private realtimeChannel: RealtimeChannel | null = null;

	constructor(pointId: string, mappingId: string) {
		this.pointId = pointId;
		this.state.mappingid = mappingId;
	}

	async init(): Promise<void> {
		const { data, error } = await supabase
			.from('point')
			.select('*')
			.filter('id', 'eq', this.pointId);

		if (error != null) throw error;

		if (data.length === 0) throw new Error('Point not found!');

		this.state.point = data[0];

		this.realtimeChannel = supabase
			.channel(`point-${this.pointId}-update`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'point',
					filter: `id=eq.${this.pointId}`
				},
				(payload) => {
					if (payload.new != null && this.state.point != null) {
						if ('acquired_by' in payload.new && payload.new.acquired_by != null) {
							this.state.point.acquired_by = payload.new.acquired_by;
						}

						if ('health' in payload.new && payload.new.health != null) {
							this.state.point.health = payload.new.health;
						}
					}
				}
			)
			.subscribe();
	}

	destroy(): void {
		this.realtimeChannel?.unsubscribe();
	}
}

export default {
	async all(): Promise<Array<Pick<Point, 'id' | 'name'>>> {
		const { data, error } = await supabase.schema('public').from('point').select('id, name');

		if (error != null) {
			throw error;
		}
		if (data != null) {
			return data;
		}

		return [];
	},

	async getPointName(pointId: string): Promise<string> {
		let name = nameCache.get(pointId);

		if (name == null) {
			const { data, error } = await supabase
				.from('point')
				.select('name')
				.filter('id', 'eq', pointId);

			if (error != null) throw error;
			else if (data != null && data.length > 0) {
				name = data[0].name;
				nameCache.set(pointId, name);
				return name;
			} else {
				throw new Error(`No name for point ${pointId}`);
			}
		}

		return name;
	}
};
