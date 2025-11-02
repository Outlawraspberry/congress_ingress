import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const { data, error: fetchError } = await supabase.from('game').select('*').eq('id', 1).single();

	if (fetchError) {
		throw fetchError;
	}

	return { gameConfig: data };
};
