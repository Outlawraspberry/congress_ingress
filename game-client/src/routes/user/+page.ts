import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase/db.svelte';

// TODO: Replace with your logic to get the current user id (from session/auth)
// For example, you might get it from parent() if you use SvelteKit's layout load
const getCurrentUserId = async () => {
	const { data } = await supabase.auth.getUser();
	return data?.user?.id ?? null;
};

export const load: PageLoad = async () => {
	const userId = await getCurrentUserId();

	let user = null;
	let userGameData = null;
	let factionName = null;
	let error = '';

	if (!userId) {
		error = 'No user is currently logged in.';
		return { user, userGameData, error };
	}

	// eFetch user info
	const { data: userData, error: userError } = await supabase
		.from('user')
		.select('*')
		.eq('id', userId)
		.single();

	// Fetch user game data
	const { data: gameData, error: gameError } = await supabase
		.from('user_game_data')
		.select('*')
		.eq('user_id', userId)
		.single();

	if (userError || gameError) {
		error = userError?.message || gameError?.message || 'Unknown error';
	} else {
		user = userData;
		userGameData = gameData;

		// Fetch faction name if faction_id exists
		if (gameData?.faction_id) {
			const { data: factionData, error: factionError } = await supabase
				.from('faction')
				.select('name')
				.eq('id', gameData.faction_id)
				.single();

			if (!factionError && factionData) {
				factionName = factionData.name;
			}
		}
	}

	return {
		user,
		userGameData,
		factionName,
		error
	};
};
