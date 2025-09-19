import type { PointState } from '$lib/supabase/game/points.svelte';
import { getRealPoint } from './get-point-my-mapping-id.svelte';

export const selectedPoint: {
	selectedPoint: PointState | null;
} = $state({
	selectedPoint: null
});

export async function initSelectedPoint(mappingId: string): Promise<PointState | null> {
	try {
		selectedPoint.selectedPoint = await getRealPoint(mappingId);
		if (selectedPoint == null) {
			return null;
		}
	} catch (error) {
		console.error(error);
	}

	return selectedPoint.selectedPoint;
}

export function destroySelectedPoint(): void {
	if (selectedPoint.selectedPoint) {
		selectedPoint.selectedPoint.destroy();
		selectedPoint.selectedPoint = null;
	}
}
