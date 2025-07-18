<script lang="ts">
	import { Button, Heading, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import type { User, Fraction, Point } from '../../types/alias';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import { game } from '$lib/supabase/game/game.svelte';


	const {
		data
	}: {
		data: {
			user: User;
			fraction: Fraction;
		};
	} = $props();

	let realtimeChannel: RealtimeChannel | undefined = undefined;

	let points: Point[] = $state([]);

	onMount(async () => {
		const { data, error } = await supabase.from('point').select('*');

		if (data != null) {
			points = data;
		}
	});
</script>

<Heading tag="h1">Game</Heading>

<P>Welcome {data.user.name}.</P>
<P>Your fraction {data.fraction.name}.</P>

<P
	>The game is: {#if game.game?.state === 'paused'}
		Paused
	{:else}
		Running
	{/if}</P
>
<P>Games current tick: {game.game?.tick}</P>

<ul class="flex">
	{#each points as point (point.id)}
		<li class="m-1 border-1 p-1">
			<P>{point.name}</P>
			<Button href={`/game/point/${point.id}`}>Open</Button>
		</li>
	{/each}
</ul>
