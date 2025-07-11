import { userStore } from '$lib/supabase/db.svelte';
import fractionMod from '$lib/supabase/fraction/fraction';
import userMod from '$lib/supabase/user/user';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import game from '$lib/supabase/game/game';

export const load: PageLoad = async () => {
	if (userStore.session == null || userStore.user == null) {
		redirect(308, '/');
	}

	const user = await userMod.you();
	if (user == null) {
		throw new Error(`User ${userStore.user.id} not found`);
	}

	const fraction = await fractionMod.get(user.fraction);
	if (fraction == null) {
		throw new Error(`Fraction ${user.fraction} not found`);
	}

	const initialGameState = await game.getGame();

	return {
		user,
		fraction,
		game: initialGameState
	};
};
