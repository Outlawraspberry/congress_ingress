import { PointState } from '$lib/supabase/game/points.svelte';

export const selectedPoint: {
	selectedPoint: PointState | null;
} = $state({
	selectedPoint: null
});

export async function initSelectedPoint(id: string): Promise<PointState | null> {
	try {
		const selPoint = new PointState(id);
		await selPoint.init();
		await selPoint.initCurrentUsers();

		selectedPoint.selectedPoint = selPoint;
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
