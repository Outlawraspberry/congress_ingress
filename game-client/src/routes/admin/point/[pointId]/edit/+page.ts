import { supabase } from '$lib/supabase/db.svelte';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	await parent();

	const [pointResponse, factionsResponse] = await Promise.all([
		supabase.from('point').select('*').eq('id', params.pointId).single(),
		supabase.from('faction').select('id, name').order('name')
	]);

	if (pointResponse.error) {
		throw error(404, 'Point not found');
	}

	if (factionsResponse.error) {
		console.error('Error loading factions:', factionsResponse.error);
		return {
			point: pointResponse.data,
			factions: []
		};
	}

	return {
		point: pointResponse.data,
		factions: factionsResponse.data || []
	};
};
