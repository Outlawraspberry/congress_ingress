<script lang="ts">
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import faction from '$lib/supabase/faction/faction';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { Heading, P, Progressbar } from 'flowbite-svelte';
	import { onDestroy } from 'svelte';

	const { data }: { data: { point: PointState } } = $props();

	let factionName = $state('Unclaimed');

	let progress = $derived(
		data.point.state.point
			? Math.round((100 / data.point.state.point.max_health) * data.point.state.point.health)
			: 0
	);

	$effect(() => {
		if (data.point.state.point?.acquired_by) {
			faction.getName(data.point.state.point.acquired_by).then((name) => {
				if (name) factionName = name;
			});
		} else {
			factionName = 'Unclaimed';
		}
	});

	onDestroy(() => {
		data.point.destroy();
	});
</script>

<Heading class="text-center" tag="h1">{data.point.state.point?.name}</Heading>

<section class="container">
	<section class="my-5">
		<P class="text-center">Acquired by: {factionName}</P>
		<Progressbar {progress} animate={true} size="h-6"></Progressbar>
		<P class="text-center">
			{data.point.state.point?.health} / {data.point.state.point?.max_health}
		</P>
	</section>

	<section class="container my-5 flex justify-center">
		<TaskOverview chosenPoint={data.point}></TaskOverview>
	</section>
</section>
