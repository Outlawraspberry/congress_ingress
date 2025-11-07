<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';

	let maxActionPoints = $state(255); // Default value
	let loading = $state(true);

	// Load max action points from game config
	async function loadMaxActionPoints() {
		try {
			const { data, error } = await supabase.rpc('get_max_action_points');
			if (error) {
				console.warn('Failed to load max action points:', error);
			} else {
				maxActionPoints = data || 255;
			}
		} catch (err) {
			console.warn('Failed to load max action points:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadMaxActionPoints();
	});

	// Calculate percentage for progress bar
	const percentage = $derived(() => {
		if (!user.user || maxActionPoints === 0) return 0;
		return Math.round((user.user.actionPoints / maxActionPoints) * 100);
	});

	// Determine color based on AP level
	const progressColor = $derived(() => {
		const pct = percentage();
		if (pct >= 75) return 'progress-success';
		if (pct >= 50) return 'progress-warning';
		if (pct >= 25) return 'progress-error';
		return 'progress-error';
	});
</script>

<div class="action-points-display">
	{#if loading || !user.user}
		<div class="flex items-center gap-2">
			<span class="loading loading-spinner loading-xs"></span>
			<span class="text-sm opacity-70">Loading AP...</span>
		</div>
	{:else}
		<div class="flex flex-col gap-1">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Action Points</span>
				<span class="text-sm font-bold">
					{user.user.actionPoints}/{maxActionPoints}
				</span>
			</div>

			<progress
				class="progress {progressColor} h-2 w-24"
				value={user.user.actionPoints}
				max={maxActionPoints}
			></progress>

			<div class="text-center text-xs opacity-70">
				{percentage()}%
			</div>
		</div>
	{/if}
</div>

<style>
	.action-points-display {
		min-width: 120px;
	}
</style>
