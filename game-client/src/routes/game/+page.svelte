<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import { game } from '$lib/supabase/game/game.svelte';
	import { Button, Heading, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import type { Faction, Point, User } from '../../types/alias';

	const {
		data
	}: {
		data: {
			user: User;
			fraction: Faction;
		};
	} = $props();

	let points: Pick<Point, 'id' | 'name'>[] = $state([]);

	onMount(async () => {
		const { data, error } = await supabase.from('point').select('*');

		if (error != null) throw error;

		if (data != null) {
			points = data;
		}
	});
</script>

<Heading class="text-center" tag="h1">Game</Heading>

<section class="my-5">
	<P class="text-center">Welcome {data.user.name}</P>
	<P class="text-center">Your fraction {data.fraction.name}</P>

	<P class="text-center"
		>The game is: {#if game.game?.state === 'paused'}
			Paused
		{:else}
			Running
		{/if}</P
	>
</section>

<section class="my-5">
	<ul class="flex justify-center gap-5">
		{#each points as point (point.id)}
			<li class="">
				<Button href={`/game/point/${point.id}`}>{point.name}</Button>
			</li>
		{/each}
	</ul>
</section>
