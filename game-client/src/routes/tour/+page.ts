import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const { data, error } = await supabase.from('game').select('*').filter('id', 'eq', '1');

	if (error) throw error;

	return { gameConfig: data[0] };
};
