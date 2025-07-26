import { PointState } from '$lib/supabase/game/points.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const pointState = new PointState(params.pointId);

	await pointState.init();

	return {
		point: pointState
	};
};
