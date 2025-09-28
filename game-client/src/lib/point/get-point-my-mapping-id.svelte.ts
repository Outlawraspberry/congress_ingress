import { supabase } from '$lib/supabase/db.svelte';
import { PointState } from '$lib/supabase/game/points.svelte';

export async function getRealPointId(mappingId: string): Promise<string | null> {
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

export async function getRealPoint(mappingId: string): Promise<PointState | null> {
	const id = await getRealPointId(mappingId);

	if (id) {
		const pointState = new PointState(id, mappingId);
		await pointState.init();
		await pointState.initCurrentUsers();
		return pointState;
	}

	return null;
}
