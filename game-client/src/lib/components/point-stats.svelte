<script lang="ts">
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import faction from '$lib/supabase/faction/faction';
	import { onDestroy } from 'svelte';
	import Card from './card.svelte';

	const { point }: { point: PointState } = $props();

	let factionName = $state('Unclaimed');

	let progress = $derived(
		point.state.point
			? Math.round((100 / point.state.point.max_health) * point.state.point.health)
			: 0
	);

	$effect(() => {
		if (point.state.point?.acquired_by) {
			faction.getName(point.state.point.acquired_by).then((name) => {
				if (name) factionName = name;
			});
		} else {
			factionName = 'Unclaimed';
		}
	});

	onDestroy(() => {
		point.destroy();
	});
</script>

<Card class="my-5 w-full">
	<p class="text-center text-lg">Acquired by: <span class="font-bold">{factionName}</span></p>
	<progress value={progress} class="progress progress-info my-3 h-5"></progress>
	<p class="text-center">
		{point.state.point?.health} / {point.state.point?.max_health}
	</p>
</Card>
