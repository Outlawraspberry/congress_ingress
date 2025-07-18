<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
	import CurrentTask from './task/current-task.svelte';
	import RunTick from './run-tick.svelte';
	import user from '$lib/supabase/user/user';
	import { onMount } from 'svelte';
	import type { User } from '../../types/alias';
	import { userStore } from '$lib/supabase/db.svelte';
	import { game } from '$lib/supabase/game/game.svelte';
	import { HomeOutline } from 'flowbite-svelte-icons';

	let you: User | undefined = $state(undefined);

	onMount(async () => {
		you = await user.you();
	});

	$effect(() => {
		if (userStore.user != null)
			user.you().then((user) => {
				you = user;
			});
	});
</script>

<header>
	<Navbar>
		<NavBrand href="/"><HomeOutline /></NavBrand>

		<div class="flex justify-center">
			{#if you != null}<CurrentTask /> |{/if}
			Tick: {game.game?.tick}
			
		</div>

		<NavUl>
			<NavLi href="/game">Game</NavLi>

			<DarkMode />
		</NavUl>

		<div class="flex items-center md:order-2">		
			{#if you != null && you.role === 'admin'}
				<RunTick />
			{/if}

			<NavHamburger />
		</div>
	</Navbar>
</header>
