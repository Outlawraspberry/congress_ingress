import { goto } from '$app/navigation';
import { supabase } from '$lib/supabase/db.svelte';
import { PointState } from '$lib/supabase/game/points.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, parent }) => {
	await parent();

	const noMappingParameter = url.searchParams.get('noMappingId') === 'true';

	const pointId = noMappingParameter ? params.pointId : await getRealPointId(params.pointId);

	if (pointId == null) {
		// FIXME not the best solution, because svelte preloads this by default
		return goto('/game/point-not-found');
	}

	const { data, error } = await supabase.rpc('does_point_exists', { a_point_id: pointId });
	if (error) throw error;
	if (data == null || data === false) {
		return goto('/game/point-not-found');
	}

	const pointState = new PointState(pointId);

	await pointState.init();

	return {
		point: pointState
	};
};

async function getRealPointId(mappingId: string): Promise<string | null> {
	const realMapping = await supabase
		.from('point_mapping')
		.select('point_id')
		.filter('id', 'eq', mappingId)
		.filter('is_active', 'eq', true);

	if (realMapping.error) throw realMapping.error;

	if (realMapping.data.length === 0) {
		return null;
	}

	return realMapping.data[0].point_id;
}
