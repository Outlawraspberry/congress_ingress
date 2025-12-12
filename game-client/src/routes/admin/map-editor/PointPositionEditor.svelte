<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { Floor, PointPosition } from '$lib/map/map.types';

	interface Props {
		floor: Floor;
	}

	let { floor }: Props = $props();

	interface PointWithPosition {
		id: string;
		name: string;
		type: string;
		x_coordinate: number | null;
		y_coordinate: number | null;
	}

	let points: PointWithPosition[] = $state([]);
	let positions: PointPosition[] = $state([]);
	let selectedPointId: string | null = $state(null);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let error: string | null = $state(null);
	let successMessage: string | null = $state(null);
	let mapContainer: HTMLDivElement | null = $state(null);
	let imageElement: HTMLImageElement | null = $state(null);

	let scale = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let lastPanX = $state(0);
	let lastPanY = $state(0);
	let touchStartDistance = $state(0);
	let lastTouchX = $state(0);
	let lastTouchY = $state(0);
	let isTouchPanning = $state(false);

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
			points = (pointsData || []).map((point) => {
				const position = positions.find((p) => p.point_id === point.id);
				return {
					id: point.id,
					name: point.name,
					type: point.type,
					x_coordinate: position ? Number(position.x_coordinate) : null,
					y_coordinate: position ? Number(position.y_coordinate) : null
				};
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
			console.error('Error loading data:', e);
		} finally {
			isLoading = false;
		}
	}

	function handleMapClick(event: MouseEvent) {
		if (!selectedPointId || !mapContainer || !imageElement || isPanning) return;

		const imgRect = imageElement.getBoundingClientRect();

		// Get click position relative to the actual displayed image
		const clickX = event.clientX - imgRect.left;
		const clickY = event.clientY - imgRect.top;

		// Convert to percentage (0-100) relative to the displayed image dimensions
		const xPercent = (clickX / imgRect.width) * 100;
		const yPercent = (clickY / imgRect.height) * 100;

		// Update point position
		const point = points.find((p) => p.id === selectedPointId);
		if (point) {
			point.x_coordinate = Math.max(0, Math.min(100, xPercent));
			point.y_coordinate = Math.max(0, Math.min(100, yPercent));
			points = [...points];
		}
	}

	function placePointAtPosition(clientX: number, clientY: number) {
		if (!selectedPointId || !imageElement) return;

		const imgRect = imageElement.getBoundingClientRect();

		// Get position relative to the actual displayed image
		const posX = clientX - imgRect.left;
		const posY = clientY - imgRect.top;

		// Convert to percentage (0-100) relative to the displayed image dimensions
		const xPercent = (posX / imgRect.width) * 100;
		const yPercent = (posY / imgRect.height) * 100;

		// Update point position
		const point = points.find((p) => p.id === selectedPointId);
		if (point) {
			point.x_coordinate = Math.max(0, Math.min(100, xPercent));
			point.y_coordinate = Math.max(0, Math.min(100, yPercent));
			points = [...points];
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

			const positionsToSave = points
				.filter((p) => p.x_coordinate !== null && p.y_coordinate !== null)
				.map((p) => ({
					point_id: p.id,
					floor_id: floor.id,
					x_coordinate: p.x_coordinate!,
					y_coordinate: p.y_coordinate!
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

			const point = points.find((p) => p.id === pointId);
			if (point) {
				point.x_coordinate = null;
				point.y_coordinate = null;
				points = [...points];
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

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		const delta = event.deltaY > 0 ? 0.9 : 1.1;
		scale = Math.max(0.5, Math.min(3, scale * delta));
	}

	function handleMouseDown(event: MouseEvent) {
		if (event.button === 1 || event.shiftKey) {
			// Middle mouse button or Shift+click
			isPanning = true;
			lastPanX = event.clientX;
			lastPanY = event.clientY;
			event.preventDefault();
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (isPanning) {
			const deltaX = event.clientX - lastPanX;
			const deltaY = event.clientY - lastPanY;
			panX += deltaX;
			panY += deltaY;
			lastPanX = event.clientX;
			lastPanY = event.clientY;
		}
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function resetView() {
		scale = 1;
		panX = 0;
		panY = 0;
	}

	function getTouchDistance(touch1: Touch, touch2: Touch): number {
		const dx = touch1.clientX - touch2.clientX;
		const dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function handleTouchStart(event: TouchEvent) {
		if (event.touches.length === 1) {
			if (selectedPointId) {
				// Single touch to place point when point is selected
				const touch = event.touches[0];
				placePointAtPosition(touch.clientX, touch.clientY);
				event.preventDefault();
			} else {
				// Single touch pan when no point selected
				isTouchPanning = true;
				lastTouchX = event.touches[0].clientX;
				lastTouchY = event.touches[0].clientY;
				event.preventDefault();
			}
		} else if (event.touches.length === 2) {
			// Two finger pinch/zoom
			isTouchPanning = false;
			touchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
			event.preventDefault();
		}
	}

	function handleTouchMove(event: TouchEvent) {
		if (event.touches.length === 1 && isTouchPanning && !selectedPointId) {
			// Pan
			const touch = event.touches[0];
			const deltaX = touch.clientX - lastTouchX;
			const deltaY = touch.clientY - lastTouchY;
			panX += deltaX;
			panY += deltaY;
			lastTouchX = touch.clientX;
			lastTouchY = touch.clientY;
			event.preventDefault();
		} else if (event.touches.length === 2) {
			// Pinch zoom
			const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
			const delta = currentDistance / touchStartDistance;
			scale = Math.max(0.5, Math.min(3, scale * delta));
			touchStartDistance = currentDistance;
			event.preventDefault();
		}
	}

	function handleTouchEnd(event: TouchEvent) {
		if (event.touches.length === 0) {
			isTouchPanning = false;
		} else if (event.touches.length === 1) {
			// Reset for single touch after pinch
			lastTouchX = event.touches[0].clientX;
			lastTouchY = event.touches[0].clientY;
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

	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		imageElement = img;
	}

	$effect(() => {
		if (mapContainer) {
			mapContainer.addEventListener('wheel', handleWheel, { passive: false });
		}
	});
</script>

<svelte:window onmouseup={handleMouseUp} onmousemove={handleMouseMove} />

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
							onchange={() => (selectedPointId = selectedPointId ? null : points[0]?.id || null)}
						/>
						<span class="label-text text-sm">Enable point placement mode</span>
					</label>
				</div>

				<div class="divider my-1"></div>

				<div class="max-h-[500px] space-y-2 overflow-y-auto">
					{#each points as point (point.id)}
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
										{#if point.x_coordinate !== null && point.y_coordinate !== null}
											<p class="text-xs opacity-60">
												Position: ({point.x_coordinate.toFixed(1)}%, {point.y_coordinate.toFixed(
													1
												)}%)
											</p>
										{:else}
											<p class="text-warning text-xs">Not positioned</p>
										{/if}
									</div>
									{#if point.x_coordinate !== null && point.y_coordinate !== null}
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
						{points.filter((p) => p.x_coordinate !== null && p.y_coordinate !== null).length} /
						{points.length} points positioned
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
				<div class="flex gap-2">
					<div class="badge badge-sm">
						Zoom: {(scale * 100).toFixed(0)}%
					</div>
					<button class="btn btn-ghost btn-xs" onclick={resetView}>Reset View</button>
				</div>
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

			<div
				bind:this={mapContainer}
				role="button"
				tabindex="0"
				class="bg-base-300 relative overflow-hidden rounded-lg border-2 {selectedPointId
					? 'border-primary cursor-crosshair'
					: 'border-base-300'}"
				style="min-height: 500px; touch-action: none;"
				onclick={handleMapClick}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						// Can't use handleMapClick with keyboard event, would need separate handler
					}
				}}
				onmousedown={handleMouseDown}
				ontouchstart={handleTouchStart}
				ontouchmove={handleTouchMove}
				ontouchend={handleTouchEnd}
			>
				{#if floor.map_image_url}
					<div
						class="absolute inset-0 flex items-center justify-center"
						style="transform: translate({panX}px, {panY}px) scale({scale}); transform-origin: center center;"
					>
						<div class="relative inline-block">
							<img
								bind:this={imageElement}
								src={floor.map_image_url}
								alt={floor.name}
								class="block select-none"
								style="max-width: 100%; max-height: 100%; width: auto; height: auto;"
								draggable="false"
								onload={handleImageLoad}
							/>

							<!-- Render positioned points - now positioned relative to the image itself -->
							{#each points.filter((p) => p.x_coordinate !== null && p.y_coordinate !== null) as point (point.id)}
								<button
									class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full {getPointColor(
										point.type
									)} {selectedPointId === point.id
										? 'ring-primary h-8 w-8 ring-4 ring-offset-2'
										: 'hover:ring-primary h-6 w-6 hover:ring-2'} shadow-lg transition-all"
									style="left: {point.x_coordinate}%; top: {point.y_coordinate}%;"
									onclick={(e) => {
										e.stopPropagation();
										handlePointSelect(point.id);
									}}
									title={point.name}
								>
									<span class="sr-only">{point.name}</span>
								</button>
							{/each}

							{#if selectedPointId}
								<div class="badge badge-primary absolute top-4 left-4 shadow-lg">
									Click on map to position point
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="flex h-full min-h-[500px] items-center justify-center">
						<div class="text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mx-auto h-16 w-16 opacity-20"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<p class="mt-4 opacity-60">No floor plan image uploaded</p>
						</div>
					</div>
				{/if}
			</div>

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
