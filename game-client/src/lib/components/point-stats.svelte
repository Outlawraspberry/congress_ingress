<script lang="ts">
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { P, Progressbar } from 'flowbite-svelte';
	import faction from '$lib/supabase/faction/faction';
	import { Section } from 'flowbite-svelte-blocks';
	import { onDestroy } from 'svelte';

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

<Section class="my-5">
	<P class="text-center">Acquired by: {factionName}</P>
	<Progressbar {progress} animate={true} size="h-6"></Progressbar>
	<P class="text-center">
		{point.state.point?.health} / {point.state.point?.max_health}
	</P>
</Section>
