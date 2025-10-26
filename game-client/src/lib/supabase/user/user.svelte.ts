import type { RealtimeChannel } from '@supabase/supabase-js';
import { type Role } from '../../../types/alias';
import { supabase, userStore } from '../db.svelte';

export const user: {
	user: {
		username: string;
		faction: string;
		lastAction: Date | null;
		role: Role;
		canUseAction: boolean;
		canUseActionInSeconds: number | null;
	} | null;
} = $state({ user: null });

let realtimeChannel: RealtimeChannel | undefined = undefined;

export async function init(): Promise<void> {
	if ((user.user != null && realtimeChannel != null) || userStore.user == null) return;

	const [userData, userRole, userGameData, userActionCooldownInSeconds] = await Promise.all([
		supabase.from('user').select('name').filter('id', 'eq', userStore.user.id),
		supabase.from('user_role').select('role').filter('user_id', 'eq', userStore.user.id),
		supabase
			.from('user_game_data')
			.select('faction_id,last_action')
			.filter('user_id', 'eq', userStore.user.id),
		supabase.from('game').select('user_last_action_timeout_in_seconds').filter('id', 'eq', 1)
	]);

	if (userData.error) throw userData.error;
	if (userGameData.error) throw userGameData.error;
	if (userRole.error) throw userRole.error;
	if (userActionCooldownInSeconds.error) throw userActionCooldownInSeconds.error;

	let lastAction: Date | null = null;
	let canUseAction = true;

	if (userGameData.data[0].last_action != null) {
		lastAction = new Date();
		lastAction.setTime(Date.parse(userGameData.data[0].last_action));

		const diff = Math.abs(lastAction.getTime() - Date.now());
		canUseAction =
			diff >= userActionCooldownInSeconds.data[0].user_last_action_timeout_in_seconds * 1000;

		if (!canUseAction) {
			setCanUseActionInSeconds(diff);
		}
	}

	user.user = {
		faction: userGameData.data[0].faction_id,
		lastAction,
		role: userRole.data[0].role,
		username: userData.data[0].name,
		canUseAction,
		canUseActionInSeconds: null
	};

	realtimeChannel = supabase
		.channel(`user-${userStore.user.id}-update`)
		.on(
			'postgres_changes',
			{
				event: 'UPDATE',
				schema: 'public',
				table: 'user_game_data',
				filter: `user_id=eq.${userStore.user.id}`
			},
			(payload) => {
				if (payload.new != null && user.user != null && payload.new.last_action != null) {
					const date = new Date();
					date.setTime(Date.parse(payload.new.last_action));

					user.user.lastAction = date;
					user.user.canUseAction = false;

					setCanUseActionInSeconds(
						userActionCooldownInSeconds.data[0].user_last_action_timeout_in_seconds * 1000
					);
				}
			}
		)
		.subscribe();
}

export function destroy(): void {
	realtimeChannel?.unsubscribe();
	user.user = null;
}

function setCanUseActionInSeconds(milliseconds: number) {
	let inSeconds = Math.ceil(milliseconds / 1000);

	if (user.user) user.user.canUseActionInSeconds = inSeconds--;

	const interval = setInterval(() => {
		if (user.user != null) {
			if (inSeconds === 0) {
				user.user.canUseActionInSeconds = null;
				user.user.canUseAction = true;
				clearInterval(interval);
				return;
			}

			user.user.canUseActionInSeconds = inSeconds--;
		}
	}, 1000);
}
