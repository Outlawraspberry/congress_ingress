<script lang="ts">
	import { Button, Card, Heading, P } from 'flowbite-svelte';
	import type { Point } from '../../../types/alias';
	import { Section } from 'flowbite-svelte-blocks';

	const {
		data
	}: {
		data: {
			points: Pick<Point, 'id' | 'name'>[];
		};
	} = $props();
</script>

<Heading class="text-center" tag="h1">Points</Heading>

<Section divClass="my-5 flex justify-center gap-5">
	{#each data.points as point (point.id)}
		<Card class="p-5">
			<Heading tag="h4">{point.name}</Heading>
			<P>{point.id}</P>

			<Button href={`/game/point/${point.id}?noMappingId=true`}>Visit</Button>
		</Card>
	{/each}
</Section>
