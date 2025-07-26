<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
	import { DarkMode, Navbar, NavBrand, NavHamburger, NavLi, NavUl, P } from 'flowbite-svelte';
	import { HomeOutline } from 'flowbite-svelte-icons';
	import RunTick from './run-tick.svelte';
	import ActionCooldown from './task/action-cooldown.svelte';
</script>

<header>
	<Navbar>
		<NavBrand href="/"><HomeOutline /></NavBrand>

		<div class="flex justify-center">
			{#if user.user != null}
				<P>{user.user.username}</P>
			{/if}
		</div>

		<div class="flex justify-center">
			<ActionCooldown></ActionCooldown>
		</div>

		<NavUl>
			<NavLi href="/game">Game</NavLi>

			<DarkMode />
		</NavUl>

		<div class="flex items-center md:order-2">
			{#if user.user != null && user.user.role === 'admin'}
				<RunTick />
			{/if}

			<NavHamburger />
		</div>
	</Navbar>
</header>
