import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	await parent();

	// Load factions for the dropdown
	const { data: factions, error } = await supabase.from('faction').select('id, name').order('name');

	if (error) {
		console.error('Error loading factions:', error);
		return { factions: [] };
	}

	return { factions: factions || [] };
};
