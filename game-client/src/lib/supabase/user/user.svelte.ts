import type { RealtimeChannel } from '@supabase/supabase-js';
import { type Role } from '../../../types/alias';
import { supabase, userStore } from '../db.svelte';

let interval: number | NodeJS.Timeout | null = null;

export const user: {
	user: {
		username: string;
		faction: string;
		factionName: string | null;
		experience: number | null;
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
			.select('faction_id,last_action,experience')
			.filter('user_id', 'eq', userStore.user.id),
		supabase.from('game').select('user_last_action_timeout_in_seconds').filter('id', 'eq', 1)
	]);

	if (userData.error) throw userData.error;
	if (userGameData.error) throw userGameData.error;
	if (userRole.error) throw userRole.error;
	if (userActionCooldownInSeconds.error) throw userActionCooldownInSeconds.error;

	let lastAction: Date | null = null;
	let canUseAction = true;
	let factionName: string | null = null;
	let experience: number | null = null;

	if (userGameData.data[0].last_action != null) {
		lastAction = new Date();
		lastAction.setTime(Date.parse(userGameData.data[0].last_action));

		const cooldownMs =
			userActionCooldownInSeconds.data[0].user_last_action_timeout_in_seconds * 1000;
		const diff = Math.abs(lastAction.getTime() - Date.now());
		canUseAction = diff >= cooldownMs;

		// Only trigger countdown if last_action is within cooldown period
		if (!canUseAction && diff <= cooldownMs) {
			setCanUseActionInSeconds(cooldownMs - diff);
		}
	}

	// Fetch faction name
	if (userGameData.data[0].faction_id) {
		const factionRes = await supabase
			.from('faction')
			.select('name')
			.filter('id', 'eq', userGameData.data[0].faction_id);

		if (!factionRes.error && factionRes.data.length > 0) {
			factionName = factionRes.data[0].name;
		}
	}

	experience = userGameData.data[0].experience ?? null;

	user.user = {
		faction: userGameData.data[0].faction_id,
		factionName,
		experience,
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
				if (payload.new != null && user.user != null) {
					if (payload.new.last_action != null) {
						const date = new Date();
						date.setTime(Date.parse(payload.new.last_action));
						user.user.lastAction = date;

						const cooldownMs =
							userActionCooldownInSeconds.data[0].user_last_action_timeout_in_seconds * 1000;
						const diff = Math.abs(date.getTime() - Date.now());
						user.user.canUseAction = diff >= cooldownMs;

						// Only trigger countdown if last_action is within cooldown period
						if (!user.user.canUseAction && diff <= cooldownMs) {
							setCanUseActionInSeconds(cooldownMs - diff);
						}
					}
					if (payload.new.experience != null) {
						console.log('experience', payload);
						user.user.experience = payload.new.experience;
					}
					if (payload.new.faction_id != null && payload.new.faction_id !== user.user.faction) {
						user.user.faction = payload.new.faction_id;
						// Fetch new faction name
						supabase
							.from('faction')
							.select('name')
							.filter('id', 'eq', payload.new.faction_id)
							.then((factionRes) => {
								if (!factionRes.error && factionRes.data.length > 0 && user.user) {
									user.user.factionName = factionRes.data[0].name;
								}
							});
					}
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

	if (interval) clearInterval(interval);

	interval = setInterval(() => {
		if (user.user != null) {
			if (inSeconds === 0) {
				user.user.canUseActionInSeconds = null;
				user.user.canUseAction = true;
				if (interval) clearInterval(interval);
				return;
			}

			user.user.canUseActionInSeconds = inSeconds--;
		}
	}, 1000);
}
