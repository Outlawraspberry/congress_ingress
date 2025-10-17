import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Point } from '../../../types/alias';
import { supabase, userStore } from '../db.svelte';

const nameCache = new Map<string, string>();

export class PointState {
	state: {
		point: Point | null;
		currentUsers: string[];
		kicked: boolean;
	} = $state({
		point: null,
		mappingid: null,
		currentUsers: [],
		kicked: false
	});

	private pointId: string;
	private pointUpdateChannel: RealtimeChannel | null = null;
	private pointUserUpdateChannel: RealtimeChannel | null = null;

	constructor(pointId: string) {
		this.pointId = pointId;
	}

	async init(): Promise<void> {
		const { data, error } = await supabase
			.from('point')
			.select('*')
			.filter('id', 'eq', this.pointId);

		if (error != null) throw error;

		if (data.length === 0) throw new Error('Point not found!');

		this.state.point = data[0];

		this.pointUpdateChannel = this.getPointUpdateChannel().subscribe();
		this.pointUserUpdateChannel = this.getPointUserUpdateChannel().subscribe();
	}

	async initCurrentUsers(): Promise<void> {
		await this.addMeToPointUser();
		this.state.currentUsers = await this.getCurrentUsesAtPoint();
	}

	destroy(): void {
		this.pointUpdateChannel?.unsubscribe();
		this.pointUserUpdateChannel?.unsubscribe();
		this.removeMeFromPointUser();
	}

	private getPointUpdateChannel(): RealtimeChannel {
		return supabase.channel(`point-${this.pointId}-update`).on(
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
		);
	}

	private getPointUserUpdateChannel(): RealtimeChannel {
		return supabase.channel(`point-user-${this.state.point!.id}-update`).on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'point_user'
			},
			(payload) => {
				if (
					!(
						('point_id' in payload.new && payload.new.point_id === this.state.point!.id) ||
						('point_id' in payload.old && payload.old.point_id === this.state.point!.id)
					)
				) {
					return;
				}

				switch (payload.eventType) {
					case 'DELETE':
						if ('user_id' in payload.old && typeof payload.old.user_id === 'string') {
							if (payload.old.user_id === userStore.user?.id) {
								this.state.kicked = true;
								this.destroy();
							} else {
								this.removeUserFromCurrentUsers(payload.old.user_id);
							}
						}

						break;
					case 'INSERT':
					case 'UPDATE':
						if (
							'user_id' in payload.new &&
							typeof payload.new.user_id === 'string' &&
							!this.state.currentUsers.includes(payload.new.user_id)
						)
							this.state.currentUsers.push(payload.new.user_id);
						break;
				}
			}
		);
	}

	private async addMeToPointUser(): Promise<void> {
		const { error } = await supabase
			.from('point_user')
			.upsert({
				point_id: this.state.point!.id!,
				user_id: userStore.user!.id
			})
			.filter('point_id', 'eq', this.state.point!.id);

		if (error) throw error;
	}

	private async removeMeFromPointUser(): Promise<void> {
		const { error } = await supabase
			.from('point_user')
			.delete()
			.filter('user_id', 'eq', userStore.user!.id);

		if (error) throw error;

		this.removeUserFromCurrentUsers(userStore.user!.id);
	}

	private removeUserFromCurrentUsers(id: string): void {
		this.state.currentUsers = this.state.currentUsers.filter((userId) => userId != id);
	}

	private async getCurrentUsesAtPoint(): Promise<string[]> {
		const { data, error } = await supabase
			.from('point_user')
			.select('user_id')
			.filter('point_id', 'eq', this.state.point!.id);
		if (error) throw error;

		return data.map((d) => d.user_id);
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
