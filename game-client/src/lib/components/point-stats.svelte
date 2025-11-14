<script lang="ts">
	import faction from '$lib/supabase/faction/faction';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import Card from './card.svelte';

	const { point, class: klazz }: { point: PointState; class?: string } = $props();

	let factionName = $state('Unclaimed');
	let activeUsersAtPoint = $derived(point.state.currentUsers.length);

	// Level information
	let pointLevel = $derived(point.state.point?.level ?? 0);
	let healthPerLevel = $derived(255); // TODO: Get from game config
	let calculatedMaxHealth = $derived(pointLevel * healthPerLevel);

	let currentProgressColor = $derived.by(() => {
		if (point.state.point == null) return 'progress-error';

		const health = point.state.point.health;
		const maxHealth = point.state.point.max_health;

		if (health >= maxHealth * 0.9) {
			return 'progress-success';
		} else if (health >= maxHealth * 0.3) {
			return 'progress-warning';
		}

		return 'progress-error';
	});

	$effect(() => {
		if (point.state.point?.acquired_by) {
			faction.getName(point.state.point.acquired_by).then((name) => {
				if (name) factionName = name;
			});
		} else {
			factionName = 'Unclaimed';
		}
	});
</script>

<Card class={`my-5 w-full ${klazz}`}>
	{#if pointLevel > 0}
		<div class="mb-2 flex items-center justify-between">
			<p class="flex-1 text-center text-lg">
				Acquired by: <span class="font-bold">{factionName}</span>
			</p>
			<div class="badge badge-primary badge-lg font-bold">Level {pointLevel}</div>
		</div>
	{:else}
		<p class="text-center text-lg">
			<span class="text-warning font-bold">Unclaimed (Level 0)</span>
		</p>
	{/if}

	{#if activeUsersAtPoint > 1}
		<p class="text-md text-center">There are {activeUsersAtPoint} active users at this point!</p>
	{/if}

	<progress
		value={point.state.point?.health}
		max={point.state.point?.max_health}
		class={`progress  my-3 h-5 ${currentProgressColor}`}
	></progress>
	<p class="text-center">
		{point.state.point?.health} / {point.state.point?.max_health}
		{#if pointLevel > 0 && point.state.point?.max_health !== calculatedMaxHealth}
			<small class="text-warning ml-2">(Expected: {calculatedMaxHealth})</small>
		{/if}
	</p>
</Card>
