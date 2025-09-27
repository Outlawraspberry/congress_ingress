<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	import type { Point } from '../../../types/alias';

	const {
		data
	}: {
		data: {
			points: Pick<Point, 'id' | 'name'>[];
		};
	} = $props();
</script>

<h1 class="mb-3 text-3xl font-bold">Points</h1>

<Breadcrump />

<section class="hero">
	<div class="hero-content flex-col">
		<section class="my-5 flex flex-wrap justify-center gap-5">
			{#each data.points as point (point.id)}
				<Card>
					<h2 class="mb-3 text-2xl font-bold">{point.name}</h2>

					<p class="mb-3">{point.id}</p>

					<a class="text-primary font-bold" href={`/admin/point/${point.id}`}>Details</a>
				</Card>
			{/each}
		</section>
	</div>
</section>
