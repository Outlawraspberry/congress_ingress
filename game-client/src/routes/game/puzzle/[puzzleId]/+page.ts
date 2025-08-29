import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { data, error } = await supabase
		.from('puzzle')
		.select('*')
		.filter('id', 'eq', params.puzzleId);

	if (error) throw error;

	if (data.length === 0) throw new Error(`puzzle "${params.puzzleId}" not found!`);

	return { puzzle: data[0] };
};
