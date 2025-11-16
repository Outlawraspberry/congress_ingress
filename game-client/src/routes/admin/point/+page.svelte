<script lang="ts">
	import { onMount } from 'svelte';
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { Point } from '../../../types/alias';

	interface PointWithPosition extends Point {
		hasPosition: boolean;
		floorName?: string;
	}

	let points: PointWithPosition[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditor = $state(false);
	let editingPoint: Point | null = $state(null);
	let searchQuery = $state('');
	let filterType: 'all' | 'claimable' | 'not_claimable' | 'mini_game' = $state('all');

	// Form state
	let formName = $state('');
	let formType: 'claimable' | 'not_claimable' | 'mini_game' = $state('claimable');
	let formLevel = $state(1);
	let formHealth = $state(100);
	let formMaxHealth = $state(100);
	let formAcquiredBy: string | null = $state(null);
	let isSaving = $state(false);
	let formError: string | null = $state(null);

	// Faction list for dropdown
	let factions: Array<{ id: string; name: string }> = $state([]);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			isLoading = true;
			error = null;

			// Load points
			const { data: pointsData, error: pointsError } = await supabase
				.from('point')
				.select('*')
				.order('name');

			if (pointsError) throw pointsError;

			// Load point positions to check which points are positioned
			const { data: positionsData, error: positionsError } = await supabase
				.from('point_positions')
				.select('point_id, floor_id, floors(name)');

			if (positionsError) throw positionsError;

			// Load factions
			const { data: factionsData, error: factionsError } = await supabase
				.from('faction')
				.select('id, name')
				.order('name');

			if (factionsError) throw factionsError;
			factions = factionsData || [];

			// Combine data
			const positionsMap = new Map(
				positionsData?.map((p) => [p.point_id, (p.floors as { name: string } | null)?.name]) || []
			);

			points = (pointsData || []).map((point) => ({
				...point,
				hasPosition: positionsMap.has(point.id),
				floorName: positionsMap.get(point.id)
			}));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
			console.error('Error loading data:', e);
		} finally {
			isLoading = false;
		}
	}

	function handleAddPoint() {
		editingPoint = null;
		formName = '';
		formType = 'claimable';
		formLevel = 1;
		formHealth = 100;
		formMaxHealth = 100;
		formAcquiredBy = null;
		formError = null;
		showEditor = true;
	}

	function handleEditPoint(point: Point) {
		editingPoint = point;
		formName = point.name;
		formType = point.type;
		formLevel = point.level;
		formHealth = point.health;
		formMaxHealth = point.max_health;
		formAcquiredBy = point.acquired_by;
		formError = null;
		showEditor = true;
	}

	function handleDeletePoint(point: Point) {
		if (
			confirm(
				`Are you sure you want to delete "${point.name}"?\n\nThis will also remove its position on the map and cannot be undone.`
			)
		) {
			deletePoint(point.id);
		}
	}

	async function deletePoint(pointId: string) {
		try {
			const { error: err } = await supabase.from('point').delete().eq('id', pointId);
			if (err) throw err;
			await loadData();
		} catch (e) {
			alert(`Failed to delete point: ${e instanceof Error ? e.message : 'Unknown error'}`);
		}
	}

	async function handleSave() {
		if (!formName.trim()) {
			formError = 'Point name is required';
			return;
		}

		if (formMaxHealth < formHealth) {
			formError = 'Health cannot exceed max health';
			return;
		}

		try {
			isSaving = true;
			formError = null;

			const pointData = {
				name: formName.trim(),
				type: formType,
				level: formLevel,
				health: formHealth,
				max_health: formMaxHealth,
				acquired_by: formAcquiredBy
			};

			if (editingPoint) {
				// Update existing point
				const { error: updateError } = await supabase
					.from('point')
					.update(pointData)
					.eq('id', editingPoint.id);

				if (updateError) throw updateError;
			} else {
				// Create new point
				const { error: insertError } = await supabase.from('point').insert(pointData);

				if (insertError) throw insertError;
			}

			showEditor = false;
			editingPoint = null;
			await loadData();
		} catch (e) {
			formError = e instanceof Error ? e.message : 'Failed to save point';
			console.error('Error saving point:', e);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		showEditor = false;
		editingPoint = null;
		formError = null;
	}

	function getTypeColor(type: string) {
		switch (type) {
			case 'claimable':
				return 'badge-primary';
			case 'mini_game':
				return 'badge-secondary';
			case 'not_claimable':
				return 'badge-accent';
			default:
				return 'badge-ghost';
		}
	}

	function getHealthColor(health: number, maxHealth: number) {
		const percent = (health / maxHealth) * 100;
		if (percent >= 75) return 'text-success';
		if (percent >= 50) return 'text-warning';
		if (percent >= 25) return 'text-orange-500';
		return 'text-error';
	}

	$effect(() => {
		// Auto-update health when max health changes in create mode
		if (!editingPoint && formHealth > formMaxHealth) {
			formHealth = formMaxHealth;
		}
	});

	// Computed filtered points
	let filteredPoints = $derived(
		points.filter((point) => {
			const matchesSearch =
				searchQuery === '' ||
				point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				point.id.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesType = filterType === 'all' || point.type === filterType;

			return matchesSearch && matchesType;
		})
	);
</script>

<div class="container mx-auto max-w-7xl p-4">
	<h1 class="mb-3 text-3xl font-bold">Point Management 🎯</h1>
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
	{:else}
		<!-- Filters and Add Button -->
		<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
				<!-- Search -->
				<input
					type="text"
					placeholder="Search points..."
					class="input input-bordered w-full md:w-64"
					bind:value={searchQuery}
				/>

				<!-- Type Filter -->
				<select class="select select-bordered" bind:value={filterType}>
					<option value="all">All Types</option>
					<option value="claimable">Claimable</option>
					<option value="mini_game">Mini Game</option>
					<option value="not_claimable">Not Claimable</option>
				</select>
			</div>

			<button class="btn btn-primary" onclick={handleAddPoint}>
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
				Add Point
			</button>
		</div>

		<!-- Point Editor Modal -->
		{#if showEditor}
			<div class="card bg-base-100 mb-6 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">{editingPoint ? 'Edit Point' : 'Create New Point'}</h2>

					{#if formError}
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
							<span>{formError}</span>
						</div>
					{/if}

					<div class="grid gap-4 md:grid-cols-2">
						<!-- Name -->
						<div class="form-control w-full md:col-span-2">
							<label class="label" for="point-name">
								<span class="label-text">Point Name *</span>
							</label>
							<input
								id="point-name"
								type="text"
								placeholder="e.g., Library Entrance"
								class="input input-bordered w-full"
								bind:value={formName}
								disabled={isSaving}
							/>
						</div>

						<!-- Type -->
						<div class="form-control w-full">
							<label class="label" for="point-type">
								<span class="label-text">Type *</span>
							</label>
							<select
								id="point-type"
								class="select select-bordered"
								bind:value={formType}
								disabled={isSaving}
							>
								<option value="claimable">Claimable</option>
								<option value="mini_game">Mini Game</option>
								<option value="not_claimable">Not Claimable</option>
							</select>
						</div>

						<!-- Level -->
						<div class="form-control w-full">
							<label class="label" for="point-level">
								<span class="label-text">Level</span>
							</label>
							<input
								id="point-level"
								type="number"
								min="1"
								max="10"
								class="input input-bordered w-full"
								bind:value={formLevel}
								disabled={isSaving}
							/>
						</div>

						<!-- Health -->
						<div class="form-control w-full">
							<label class="label" for="point-health">
								<span class="label-text">Health</span>
							</label>
							<input
								id="point-health"
								type="number"
								min="0"
								class="input input-bordered w-full"
								bind:value={formHealth}
								disabled={isSaving}
							/>
						</div>

						<!-- Max Health -->
						<div class="form-control w-full">
							<label class="label" for="point-max-health">
								<span class="label-text">Max Health</span>
							</label>
							<input
								id="point-max-health"
								type="number"
								min="1"
								class="input input-bordered w-full"
								bind:value={formMaxHealth}
								disabled={isSaving}
							/>
						</div>

						<!-- Acquired By (Faction) -->
						<div class="form-control w-full md:col-span-2">
							<label class="label" for="point-faction">
								<span class="label-text">Acquired By (Faction)</span>
							</label>
							<select
								id="point-faction"
								class="select select-bordered"
								bind:value={formAcquiredBy}
								disabled={isSaving}
							>
								<option value={null}>None (Neutral)</option>
								{#each factions as faction (faction.id)}
									<option value={faction.id}>{faction.name}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="card-actions justify-end gap-2">
						<button class="btn btn-ghost" onclick={handleCancel} disabled={isSaving}>
							Cancel
						</button>
						<button
							class="btn btn-primary"
							onclick={handleSave}
							disabled={isSaving || !formName.trim()}
						>
							{#if isSaving}
								<span class="loading loading-spinner"></span>
								Saving...
							{:else}
								{editingPoint ? 'Update Point' : 'Create Point'}
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Statistics -->
		<div class="stats mb-6 shadow">
			<div class="stat">
				<div class="stat-title">Total Points</div>
				<div class="stat-value">{points.length}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Positioned</div>
				<div class="stat-value">{points.filter((p) => p.hasPosition).length}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Claimable</div>
				<div class="stat-value">{points.filter((p) => p.type === 'claimable').length}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Mini Games</div>
				<div class="stat-value">{points.filter((p) => p.type === 'mini_game').length}</div>
			</div>
		</div>

		<!-- Points Table -->
		<div class="overflow-x-auto">
			<table class="table-zebra table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Level</th>
						<th>Health</th>
						<th>Faction</th>
						<th>Position</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredPoints as point (point.id)}
						<tr>
							<td>
								<div class="flex items-center gap-2">
									<div>
										<div class="font-bold">{point.name}</div>
										<div class="text-sm opacity-50">{point.id.slice(0, 8)}</div>
									</div>
								</div>
							</td>
							<td>
								<span class="badge {getTypeColor(point.type)}">
									{point.type.replace('_', ' ')}
								</span>
							</td>
							<td>
								<span class="badge badge-outline">Lv {point.level}</span>
							</td>
							<td>
								<div class="flex items-center gap-2">
									<span class={getHealthColor(point.health, point.max_health)}>
										{point.health} / {point.max_health}
									</span>
									<progress
										class="progress {getHealthColor(point.health, point.max_health).replace(
											'text-',
											'progress-'
										)} w-20"
										value={point.health}
										max={point.max_health}
									></progress>
								</div>
							</td>
							<td>
								{#if point.acquired_by}
									<span class="badge badge-info">
										{factions.find((f) => f.id === point.acquired_by)?.name || 'Unknown'}
									</span>
								{:else}
									<span class="badge badge-ghost">Neutral</span>
								{/if}
							</td>
							<td>
								{#if point.hasPosition}
									<div class="flex items-center gap-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="text-success h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span class="text-sm">{point.floorName || 'Positioned'}</span>
									</div>
								{:else}
									<span class="badge badge-warning">Not positioned</span>
								{/if}
							</td>
							<td>
								<div class="flex gap-2">
									<a href={`/admin/point/${point.id}`} class="btn btn-ghost btn-xs">
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
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
										View
									</a>
									<button class="btn btn-ghost btn-xs" onclick={() => handleEditPoint(point)}>
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
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
										Edit
									</button>
									<button class="btn btn-error btn-xs" onclick={() => handleDeletePoint(point)}>
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
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if filteredPoints.length === 0}
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
				<span
					>No points found. {searchQuery || filterType !== 'all'
						? 'Try adjusting your filters.'
						: 'Click "Add Point" to create your first point.'}</span
				>
			</div>
		{/if}
	{/if}
</div>
