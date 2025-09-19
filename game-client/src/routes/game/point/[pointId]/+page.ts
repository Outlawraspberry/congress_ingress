import { goto } from '$app/navigation';
import { getRealPointId } from '$lib/point/get-point-my-mapping-id.svelte';
import { initSelectedPoint } from '$lib/point/selected-point.svelte';
import { supabase } from '$lib/supabase/db.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	await parent();

	const pointId = await getRealPointId(params.pointId);

	if (pointId == null) {
		return goto('/game/point-not-found');
	}

	const { data, error } = await supabase.rpc('does_point_exists', { a_point_id: pointId });
	if (error) throw error;
	if (data == null || data === false) {
		return goto('/game/point-not-found');
	}

	await initSelectedPoint(pointId);

	goto('/game/point/');
};
