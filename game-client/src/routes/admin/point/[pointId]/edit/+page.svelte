<script lang="ts">
	import { goto } from '$app/navigation';
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let formName = $state(data.point.name);
	let formType = $state<'claimable' | 'mini_game' | 'not_claimable'>(data.point.type);
	let formLevel = $state(data.point.level);
	let formHealth = $state(data.point.health);
	let formMaxHealth = $state(data.point.max_health);
	let formAcquiredBy = $state<string | null>(data.point.acquired_by);
	let formVisible = $state<boolean | null>(data.point.visible);
	let isSaving = $state(false);
	let formError = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!formName.trim()) {
			formError = 'Point name is required';
			return;
		}

		isSaving = true;
		formError = '';

		try {
			const pointData = {
				name: formName.trim(),
				type: formType,
				level: formLevel,
				health: formHealth,
				max_health: formMaxHealth,
				acquired_by: formAcquiredBy || null,
				visible: formVisible || false
			};

			const { error: updateError } = await supabase
				.from('point')
				.update(pointData)
				.eq('id', data.point.id);

			if (updateError) throw updateError;

			await goto(`/admin/point/${data.point.id}`);
		} catch (err) {
			console.error('Error updating point:', err);
			formError = err instanceof Error ? err.message : 'Failed to update point';
			isSaving = false;
		}
	}

	function handleCancel() {
		goto(`/admin/point/${data.point.id}`);
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<h1 class="mb-3 text-3xl font-bold">Edit Point: {data.point.name}</h1>

	<Breadcrump />

	<div class="card bg-base-100 mt-6 shadow-xl">
		<div class="card-body">
			{#if formError}
				<div class="alert alert-error mb-4">
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

			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
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
							required
						/>
					</div>

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
							{#each data.factions as faction (faction.id)}
								<option value={faction.id}>{faction.name}</option>
							{/each}
						</select>
					</div>

					<div class="form-control w-full">
						<label class="label" for="point-max-health">
							<span class="label-text">Visible</span>
						</label>
						<input
							id="point-max-health"
							type="checkbox"
							class="input input-bordered"
							bind:checked={formVisible}
							disabled={isSaving}
						/>
					</div>
				</div>

				<div class="card-actions justify-end gap-2 pt-4">
					<button type="button" class="btn btn-ghost" onclick={handleCancel} disabled={isSaving}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSaving}>
						{#if isSaving}
							<span class="loading loading-spinner"></span>
							Saving...
						{:else}
							Save Changes
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
