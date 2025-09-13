<script lang="ts">
	import { A, Card, Heading, P } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import type { Point } from '../../../types/alias';

	const {
		data
	}: {
		data: {
			points: Pick<Point, 'id' | 'name'>[];
		};
	} = $props();
</script>

<Section>
	<Heading class="text-center" tag="h1">Points</Heading>

	<Section divClass="my-5 flex justify-center gap-5">
		{#each data.points as point (point.id)}
			<Card class="p-5">
				<Heading tag="h4">{point.name}</Heading>
				<P>{point.id}</P>

				<A href={`/admin/point/${point.id}`}>Details</A>
				<A href={`/game/point/${point.id}?noMappingId=true`}>Game</A>
			</Card>
		{/each}
	</Section>
</Section>
