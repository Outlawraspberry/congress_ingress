import { goto } from '$app/navigation';
import { supabase } from '$lib/supabase/db.svelte';
import { PointState } from '$lib/supabase/game/points.svelte';
import type { PageLoad } from './$types';
import { userStore } from '$lib/supabase/db.svelte';

export const load: PageLoad = async ({ params, url, parent }) => {
	await parent();

	console.log('Page', userStore.user);

	const noMappingParameter = url.searchParams.get('noMappingId') === 'true';

	const pointId = noMappingParameter ? params.pointId : await getRealPointId(params.pointId);

	const { data, error } = await supabase.rpc('does_point_exists', { a_point_id: pointId });
	if (error) throw error;
	if (data == null || data === false) throw new Error('Point not found!');

	const pointState = new PointState(pointId);

	await pointState.init();

	return {
		point: pointState
	};
};

async function getRealPointId(mappingId: string): Promise<string> {
	const realMapping = await supabase
		.from('point_mapping')
		.select('point_id')
		.filter('id', 'eq', mappingId);

	if (realMapping.error) throw realMapping.error;

	if (realMapping.data.length === 0) throw new Error('Point not found!');

	return realMapping.data[0].point_id;
}
