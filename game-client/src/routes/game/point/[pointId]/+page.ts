import { goto } from '$app/navigation';
import { initSelectedPoint } from '$lib/point/selected-point.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	await parent();

	if ((await initSelectedPoint(params.pointId)) == null) {
		goto('/game/point-not-found');
		return;
	}

	goto('/game/point/');
};
