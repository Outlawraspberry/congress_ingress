import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	await parent();
	const points = await supabase.from('point').select('id,name');
	if (points.error) throw points.error;

	return { points: points.data };
};
