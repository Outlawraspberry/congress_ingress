<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { Fraction, Game, User } from '$lib/supabase/alias';
	import type { RealtimeChannel } from '@supabase/supabase-js';

	const {
		data
	}: {
		data: {
			user: User;
			fraction: Fraction;
			game: Game;
		};
	} = $props();

	let game: Game = $state(data.game);
	let realtimeChannel: RealtimeChannel | undefined = undefined;

	onDestroy(() => {
		realtimeChannel?.unsubscribe();
	});

	onMount(() => {
		realtimeChannel = supabase
			.channel('custom-update-channel')
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'game', filter: 'id=eq.1' },
				(payload) => {
					if ('state' in payload.new) {
						game.state = payload.new.state;
					}
					if ('tick' in payload.new) {
						game.tick = payload.new.tick;
					}
				}
			)
			.subscribe();
	});
</script>

<Heading tag="h1">Game</Heading>

<P>Welcome {data.user.name}.</P>
<P>Your fraction {data.fraction.name}.</P>

<P
	>The game is: {#if game.state === 'paused'}
		Paused
	{:else}
		Running
	{/if}</P
>
<P>Games current tick: {game.tick}</P>
