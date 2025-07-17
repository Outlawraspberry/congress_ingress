import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [pointResult] = await Promise.all([
		supabase.from('point').select('*').filter('id', 'eq', params.pointId)
	]);

	if (pointResult.error != null) {
		throw pointResult.error;
	}

	return {
		point: pointResult.data[0],
		pointId: params.pointId
	};
};
