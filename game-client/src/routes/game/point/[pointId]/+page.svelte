<script lang="ts">
	import PointStats from '$lib/components/point-stats.svelte';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { Heading } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';

	const { data }: { data: { point: PointState } } = $props();
</script>

<Heading class="text-center" tag="h1">{data.point.state.point?.name}</Heading>

<Section>
	<PointStats point={data.point}></PointStats>

	<section class="container my-5 flex justify-center">
		<TaskOverview chosenPoint={data.point}></TaskOverview>
	</section>
</Section>
