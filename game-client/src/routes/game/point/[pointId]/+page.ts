import { goto } from '$app/navigation';
import { getRealPointId } from '$lib/point/get-point-my-mapping-id.svelte';
import { supabase } from '$lib/supabase/db.svelte';
import { PointState } from '$lib/supabase/game/points.svelte';
import { user } from '$lib/supabase/user/user.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	await parent();

	if (user.user != null && user.user.role !== 'admin') goto('/game/point');

	const pointId = await getRealPointId(params.pointId);

	if (pointId == null) {
		// FIXME not the best solution, because svelte preloads this by default
		return goto('/game/point-not-found');
	}

	const { data, error } = await supabase.rpc('does_point_exists', { a_point_id: pointId });
	if (error) throw error;
	if (data == null || data === false) {
		return goto('/game/point-not-found');
	}

	const pointState = new PointState(pointId, params.pointId);

	await pointState.init();

	return {
		point: pointState
	};
};
