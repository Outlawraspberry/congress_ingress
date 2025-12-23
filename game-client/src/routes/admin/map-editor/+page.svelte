<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import { initializeMap, switchFloor } from '$lib/map';
	import type { Floor } from '$lib/map/map.types';
	import { supabase } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';
	import FloorEditor from './FloorEditor.svelte';
	import PointPositionEditor from './PointPositionEditor.svelte';
	import { ArrowLeft, CircleX, Cross, Plus, Save } from '@lucide/svelte';

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
			<CircleX />
			<span>{error}</span>
		</div>
	{:else if view === 'floors'}
		<div class="mb-4 flex items-center justify-between">
			<div class="tabs tabs-boxed">
				<button class="tab tab-active">Floors</button>
			</div>
			<button class="btn btn-primary" onclick={handleAddFloor}>
				<Plus />
				Add Floor
			</button>
		</div>

		{#if showFloorEditor}
			<FloorEditor floor={editingFloor} onSave={handleFloorSaved} onCancel={handleFloorCancel} />
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each floors as floor (floor.id)}
					<div class="card bg-base-200 shadow-xl">
						{#if !floor.is_active}
							<div class="badge badge-warning absolute top-2 right-2">Inactive</div>
						{/if}
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
					<Save />
					<span>No floors created yet. Click "Add Floor" to get started.</span>
				</div>
			{/if}
		{/if}
	{/if}
</div>

{#if view === 'points' && selectedFloor}
	<div class="h-dvh">
		<div class="back-button-container">
			<button class="btn btn-ghost btn-sm" onclick={backToFloors}>
				<ArrowLeft />
				Back to Floors
			</button>
		</div>

		<PointPositionEditor floor={selectedFloor} />
	</div>
{/if}
