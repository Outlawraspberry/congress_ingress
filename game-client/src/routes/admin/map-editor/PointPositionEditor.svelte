<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { Floor, MapPoint, MapPointPosition, PointPosition } from '$lib/map/map.types';
	import MapView from '$lib/map/components/MapView.svelte';
	import { C3NavService } from '$lib/c3-nav/c3-nav-servier';
	import { derived, writable, type Writable } from 'svelte/store';
	import { currentFloorId } from '$lib/map';

	interface Props {
		floor: Floor;
	}

	let { floor }: Props = $props();

	let points: Writable<MapPoint<MapPointPosition | null>[]> = writable([]);
	let positions: PointPosition[] = $state([]);
	let selectedPointId: string | null = $state(null);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let error: string | null = $state(null);
	let successMessage: string | null = $state(null);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			isLoading = true;
			error = null;

			// Load all points
			const { data: pointsData, error: pointsError } = await supabase
				.from('point')
				.select('id, name, type')
				.order('name');

			if (pointsError) throw pointsError;

			// Load positions for this floor
			const { data: positionsData, error: positionsError } = await supabase
				.from('point_positions')
				.select('*')
				.eq('floor_id', floor.id);

			if (positionsError) throw positionsError;

			positions = positionsData || [];

			// Merge points with their positions
			$points = (pointsData || []).map((point) => {
				const position: PointPosition | undefined = positions.find((p) => p.point_id === point.id);
				let mapPosition: MapPointPosition | null = null;

				if (position) {
					mapPosition = {
						floorId: position.floor_id,
						x: position.x_coordinate,
						y: position.y_coordinate
					};
				}

				return {
					id: point.id,
					name: point.name,
					type: point.type,
					level: 0,
					maxHealth: 0,
					position: mapPosition,
					factionId: null,
					health: 0,
					isDiscovered: false,
					isVisible: false
				};
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
			console.error('Error loading data:', e);
		} finally {
			isLoading = false;
		}
	}

	function handleMapClick(lat: number, lng: number) {
		if (!selectedPointId) return;

		// Update point position
		const point = $points.find((p) => p.id === selectedPointId);
		if (point) {
			point.position = { floorId: floor.id, x: lat, y: lng };
			$points = [...$points];
		}
	}

	function handlePointSelect(pointId: string) {
		selectedPointId = selectedPointId === pointId ? null : pointId;
	}

	async function savePositions() {
		try {
			isSaving = true;
			error = null;
			successMessage = null;

			const pointsWithPosition: MapPoint[] = $points.filter(
				(p) => p.position != null && p.position?.x != null && p.position?.y != null
			) as MapPoint[];
			const positionsToSave = pointsWithPosition.map((p) => ({
				point_id: p.id,
				floor_id: floor.id,
				x_coordinate: p.position.x,
				y_coordinate: p.position.y
			}));

			if (positionsToSave.length === 0) {
				error = 'No positions to save';
				return;
			}

			const { error: saveError } = await supabase
				.from('point_positions')
				.upsert(positionsToSave, { onConflict: 'point_id' });

			if (saveError) throw saveError;

			successMessage = `Saved ${positionsToSave.length} point position(s) successfully!`;
			setTimeout(() => {
				successMessage = null;
			}, 3000);

			await loadData();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save positions';
			console.error('Error saving positions:', e);
		} finally {
			isSaving = false;
		}
	}

	async function removePosition(pointId: string) {
		try {
			const { error: deleteError } = await supabase
				.from('point_positions')
				.delete()
				.eq('point_id', pointId);

			if (deleteError) throw deleteError;

			const point = $points.find((p) => p.id === pointId);
			if (point?.position) {
				point.position = null;
				$points = [...$points];
			}

			successMessage = 'Position removed successfully!';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove position';
			console.error('Error removing position:', e);
		}
	}

	function getPointColor(type: string) {
		switch (type) {
			case 'claimable':
				return 'bg-primary';
			case 'mini_game':
				return 'bg-secondary';
			case 'not_claimable':
				return 'bg-accent';
			default:
				return 'bg-neutral';
		}
	}
</script>

<div class="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
	<!-- Point List -->
	<div class="card bg-base-100 shadow-xl lg:col-span-1">
		<div class="card-body">
			<h3 class="card-title">Points</h3>

			{#if isLoading}
				<div class="flex justify-center py-4">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			{:else}
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-2">
						<input
							type="checkbox"
							class="checkbox checkbox-sm"
							checked={selectedPointId !== null}
							onchange={() => (selectedPointId = selectedPointId ? null : $points[0]?.id || null)}
						/>
						<span class="label-text text-sm">Enable point placement mode</span>
					</label>
				</div>

				<div class="divider my-1"></div>

				<div class="max-h-[500px] space-y-2 overflow-y-auto">
					{#each $points as point (point.id)}
						<div
							class="card bg-base-200 hover:bg-base-300 w-full cursor-pointer border-2 text-left transition-all {selectedPointId ===
							point.id
								? 'border-primary'
								: 'border-transparent'}"
							role="button"
							tabindex="0"
							onclick={() => handlePointSelect(point.id)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handlePointSelect(point.id);
								}
							}}
						>
							<div class="card-body p-3">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<div class="badge {getPointColor(point.type)} badge-sm"></div>
											<h4 class="text-sm font-semibold">{point.name}</h4>
										</div>
										<p class="text-xs opacity-60">{point.type}</p>
										{#if point.position != null && point.position?.x !== null && point.position?.y !== null}
											<p class="text-xs opacity-60">
												Position: ({point.position?.x.toFixed(1)}%, {point.position?.y.toFixed(1)}%)
											</p>
										{:else}
											<p class="text-warning text-xs">Not positioned</p>
										{/if}
									</div>
									{#if point.position?.x !== null && point.position?.y !== null}
										<button
											class="btn btn-ghost btn-xs"
											aria-label="Remove position"
											onclick={(e) => {
												e.stopPropagation();
												removePosition(point.id);
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="divider my-2"></div>

				<div class="flex flex-col gap-2">
					<button class="btn btn-primary btn-sm" onclick={savePositions} disabled={isSaving}>
						{#if isSaving}
							<span class="loading loading-spinner loading-xs"></span>
							Saving...
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
								/>
							</svg>
							Save All Positions
						{/if}
					</button>

					<div class="text-xs opacity-60">
						{$points.filter((p) => p.position?.x !== null && p.position?.y !== null).length} /
						{$points.length} points positioned
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Map View -->
	<div class="card bg-base-100 shadow-xl lg:col-span-2">
		<div class="card-body">
			<div class="flex items-center justify-between">
				<h3 class="card-title">
					{floor.name}
					{#if floor.building_name}
						<span class="badge badge-ghost">{floor.building_name}</span>
					{/if}
				</h3>
			</div>

			{#if error}
				<div class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			{#if successMessage}
				<div class="alert alert-success">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{successMessage}</span>
				</div>
			{/if}

			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<div class="text-sm">
					<p class="font-semibold">Instructions:</p>
					<ul class="list-inside list-disc space-y-1">
						<li>Select a point from the list on the left</li>
						<li>Click/tap on the map to position the point</li>
						<li>Desktop: Scroll to zoom, Shift+drag to pan</li>
						<li>Mobile: Pinch to zoom, drag with one finger to pan</li>
						<li>Click "Save All Positions" when done</li>
					</ul>
				</div>
			</div>

			<MapView
				selectedPointId={null}
				tileServerUrl={C3NavService.instance.mapSettings?.tile_server || ''}
				initialBounds={C3NavService.instance.mapSettings?.initial_bounds || null}
				on:mapClickPosition={(event) => {
					handleMapClick(event.detail.position.lat, event.detail.position.lng);
				}}
				points={derived([points], (points) => {
					return points[0].filter((point) => point.position != null) as MapPoint[];
				})}
			/>

			<!-- Legend -->
			<div class="mt-4 flex flex-wrap gap-4">
				<div class="flex items-center gap-2">
					<div class="badge bg-primary badge-sm"></div>
					<span class="text-sm">Claimable</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="badge bg-secondary badge-sm"></div>
					<span class="text-sm">Mini Game</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="badge bg-accent badge-sm"></div>
					<span class="text-sm">Not Claimable</span>
				</div>
			</div>
		</div>
	</div>
</div>
