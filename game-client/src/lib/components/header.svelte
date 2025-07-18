<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
	import CurrentTask from './task/current-task.svelte';
	import RunTick from './run-tick.svelte';
	import user from '$lib/supabase/user/user';
	import { onMount } from 'svelte';
	import type { User } from '../../types/alias';
	import { userStore } from '$lib/supabase/db.svelte';

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
		<NavBrand href="/">Home</NavBrand>

		<NavUl>
			<NavLi href="/game">Game</NavLi>
			{#if you != null}<NavLi><CurrentTask /></NavLi>{/if}

			<DarkMode />
		</NavUl>

		<div class="flex items-center md:order-2">
			<NavHamburger />

			{#if you != null && you.role === 'admin'}
				<RunTick />
			{/if}
		</div>
	</Navbar>
</header>
