import type { PointState } from '$lib/supabase/game/points.svelte';
import { getRealPoint } from './get-point-my-mapping-id.svelte';

export const selectedPoint: {
	selectedPoint: PointState | null;
} = $state({
	selectedPoint: null
});

export async function initSelectedPoint(pointId: string): Promise<void> {
	selectedPoint.selectedPoint = await getRealPoint(pointId);
}

export function destroySelectedPoint(): void {
	if (selectedPoint.selectedPoint) {
		selectedPoint.selectedPoint.destroy();
		selectedPoint.selectedPoint = null;
	}
}
