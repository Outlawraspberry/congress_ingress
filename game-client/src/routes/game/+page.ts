import { userStore } from '$lib/supabase/db.svelte';
import factionMod from '$lib/supabase/faction/faction';
import { user } from '$lib/supabase/user/user.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (userStore.session == null || userStore.user == null) {
		redirect(308, '/');
	}

	if (user.user == null) throw new Error('No user');

	const fraction = await factionMod.get(user.user.faction);
	if (fraction == null) {
		throw new Error(`Fraction ${user.user?.faction} not found`);
	}

	return {
		user,
		fraction
	};
};
