import { supabase } from '$lib/supabase/db.svelte';
import { PointState } from '$lib/supabase/game/points.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	await parent();

	const [pointResponse, mappingResponse] = await Promise.all([
		await supabase.from('point').select('*').filter('id', 'eq', params.pointId),
		await supabase.from('point_mapping').select('*').filter('point_id', 'eq', params.pointId)
	]);

	if (pointResponse.error) throw pointResponse.error;
	if (mappingResponse.error) throw mappingResponse.error;

	const pointState = new PointState(params.pointId);

	await pointState.init();

	return { pointData: pointResponse.data[0], mappingData: mappingResponse.data, pointState };
};
