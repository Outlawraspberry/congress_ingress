<script lang="ts">
	import { C3NavService } from '$lib/c3-nav/c3-nav-servier';
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import MapView from '$lib/map/components/MapView.svelte';
	import type { Floor } from '$lib/map/map.types';
	import { supabase } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';
	import FloorEditor from './FloorEditor.svelte';
	import { FloorSwitcher, initializeMap, switchFloor } from '$lib/map';

	let floors: Floor[] = $state([]);
	let selectedFloor: Floor | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showFloorEditor = $state(false);
	let editingFloor: Floor | null = $state(null);
	let view: 'floors' | 'points' = $state('floors');

	onMount(async () => {
		await Promise.all([loadFloorsData(), initializeMap()]);
	});

	async function loadFloorsData() {
		try {
			isLoading = true;
			error = null;
			// Load all floors (including inactive ones for admin)
			const { data, error: err } = await supabase
				.from('floors')
				.select('*')
				.order('display_order', { ascending: true });

			if (err) throw err;
			floors = data || [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load floors';
			console.error('Error loading floors:', e);
		} finally {
			isLoading = false;
		}
	}

	function handleAddFloor() {
		editingFloor = null;
		showFloorEditor = true;
	}

	function handleEditFloor(floor: Floor) {
		editingFloor = floor;
		showFloorEditor = true;
	}

	function handleDeleteFloor(floor: Floor) {
		if (confirm(`Are you sure you want to delete floor "${floor.name}"? This cannot be undone.`)) {
			deleteFloor(floor.id);
		}
	}

	async function deleteFloor(floorId: number) {
		try {
			const { error: err } = await supabase.from('floors').delete().eq('id', floorId);
			if (err) throw err;
			await loadFloorsData();
			if (selectedFloor?.id === floorId) {
				selectedFloor = null;
			}
		} catch (e) {
			alert(`Failed to delete floor: ${e instanceof Error ? e.message : 'Unknown error'}`);
		}
	}

	function handleFloorSaved() {
		showFloorEditor = false;
		editingFloor = null;
		loadFloorsData();
	}

	function handleFloorCancel() {
		showFloorEditor = false;
		editingFloor = null;
	}

	async function selectFloorForPointEditing(floor: Floor) {
		selectedFloor = floor;
		view = 'points';
		// Switch to the selected floor in the map store before MapView mounts
		await switchFloor(floor.id);
	}

	function backToFloors() {
		view = 'floors';
		selectedFloor = null;
	}
</script>

<div class="container mx-auto max-w-7xl p-4">
	<h1 class="mb-3 text-3xl font-bold">Map Editor 🗺️</h1>
	<Breadcrump />

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else if error}
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
	{:else if view === 'floors'}
		<div class="mb-4 flex items-center justify-between">
			<div class="tabs tabs-boxed">
				<button class="tab tab-active">Floors</button>
			</div>
			<button class="btn btn-primary" onclick={handleAddFloor}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Add Floor
			</button>
		</div>

		{#if showFloorEditor}
			<FloorEditor floor={editingFloor} onSave={handleFloorSaved} onCancel={handleFloorCancel} />
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each floors as floor (floor.id)}
					<div class="card bg-base-200 shadow-xl">
						<figure class="bg-base-300 relative h-48 overflow-hidden">
							{#if floor.map_image_url}
								<img
									src={floor.map_image_url}
									alt={floor.name}
									class="h-full w-full object-cover"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-16 w-16 opacity-20"
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
								</div>
							{/if}
							{#if !floor.is_active}
								<div class="badge badge-warning absolute top-2 right-2">Inactive</div>
							{/if}
						</figure>
						<div class="card-body">
							<h2 class="card-title">
								{floor.name}
								{#if floor.building_name}
									<div class="badge badge-ghost">{floor.building_name}</div>
								{/if}
							</h2>
							<p class="text-sm opacity-70">Display Order: {floor.display_order}</p>
							<div class="card-actions justify-end">
								<button
									class="btn btn-sm btn-primary"
									onclick={() => selectFloorForPointEditing(floor)}
								>
									Edit Points
								</button>
								<button class="btn btn-sm btn-ghost" onclick={() => handleEditFloor(floor)}>
									Edit
								</button>
								<button class="btn btn-sm btn-error" onclick={() => handleDeleteFloor(floor)}>
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if floors.length === 0}
				<div class="alert">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="stroke-info h-6 w-6 shrink-0"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>No floors created yet. Click "Add Floor" to get started.</span>
				</div>
			{/if}
		{/if}
	{/if}
</div>

{#if view === 'points' && selectedFloor}
	<div class="map-fullscreen">
		<div class="back-button-container">
			<button class="btn btn-ghost btn-sm" onclick={backToFloors}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back to Floors
			</button>
		</div>

		<MapView
			selectedPointId={null}
			tileServerUrl={C3NavService.instance.mapSettings?.tile_server || ''}
			initialBounds={C3NavService.instance.mapSettings?.initial_bounds || null}
		/>
		<FloorSwitcher />
	</div>
{/if}

<style>
	.map-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1000;
		background: #f5f5f5;
	}

	@media (min-width: 768px) {
		.map-fullscreen {
			top: 4rem;
			height: calc(100vh - 4rem);
		}
	}

	.back-button-container {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 1001;
	}
</style>
