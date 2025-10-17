<script lang="ts">
	import faction from '$lib/supabase/faction/faction';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import Card from './card.svelte';

	const { point, class: klazz }: { point: PointState; class?: string } = $props();

	let factionName = $state('Unclaimed');
	let activeUsersAtPoint = $derived(point.state.currentUsers.length);

	let currentProgressColor = $derived.by(() => {
		const health = point.state.point!.health;
		const maxHealth = point.state.point!.max_health;

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
	<p class="text-center text-lg">Acquired by: <span class="font-bold">{factionName}</span></p>

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
	</p>
</Card>
