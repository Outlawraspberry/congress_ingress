import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Role } from '../../../types/alias';
import { supabase, userStore } from '../db.svelte';

export const user: {
	user: {
		username: string;
		faction: string;
		lastAction: Date | null;
		role: Role;
	} | null;
} = $state({ user: null });

let realtimeChannel: RealtimeChannel | undefined = undefined;

export async function init(): Promise<void> {
	if ((user.user != null && realtimeChannel != null) || userStore.user == null) return;

	const [userData, userRole, userGameData] = await Promise.all([
		supabase.from('user').select('name').filter('id', 'eq', userStore.user.id),
		supabase.from('user_role').select('role').filter('user_id', 'eq', userStore.user.id),
		supabase
			.from('user_game_data')
			.select('faction_id,last_action')
			.filter('user_id', 'eq', userStore.user.id)
	]);

	if (userData.error) throw userData.error;
	if (userGameData.error) throw userGameData.error;
	if (userRole.error) throw userRole.error;

	let lastAction: Date | null = null;
	if (userGameData.data[0].last_action != null) {
		lastAction = new Date();
		lastAction.setTime(Date.parse(userGameData.data[0].last_action));
	}
	user.user = {
		faction: userGameData.data[0].faction_id,
		lastAction,
		role: userRole.data[0].role,
		username: userData.data[0].name
	};
	console.log(user.user);

	realtimeChannel = supabase.channel(`user-${userStore.user.id}-update`).on(
		'postgres_changes',
		{
			event: 'UPDATE',
			schema: 'public',
			table: 'user_game_data',
			filter: `user_id:eq.${userStore.user.id}`
		},
		(payload) => {
			if (payload.new != null && user.user != null && payload.new.last_action != null) {
				user.user.lastAction = payload.new.last_action;
			}
		}
	);
}

export function destroy(): void {
	realtimeChannel?.unsubscribe();
	user.user = null;
}
