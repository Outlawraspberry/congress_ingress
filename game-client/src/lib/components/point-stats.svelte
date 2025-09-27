<script lang="ts">
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import faction from '$lib/supabase/faction/faction';
	import { onDestroy } from 'svelte';
	import Card from './card.svelte';

	const { point, class: klazz }: { point: PointState; class?: string } = $props();

	let factionName = $state('Unclaimed');

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

<Card class={`my-5 w-full ${klazz}`}>
	<p class="text-center text-lg">Acquired by: <span class="font-bold">{factionName}</span></p>
	<progress
		value={point.state.point?.health}
		max={point.state.point?.max_health}
		class="progress progress-info my-3 h-5"
	></progress>
	<p class="text-center">
		{point.state.point?.health} / {point.state.point?.max_health}
	</p>
</Card>
