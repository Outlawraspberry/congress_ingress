<script lang="ts">
	import { page } from '$app/state';
	import { userStore } from '$lib/supabase/db.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import { Alert, DarkMode, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import { HomeOutline } from 'flowbite-svelte-icons';
	import RunTick from './run-tick.svelte';
	import ActionCooldown from './task/action-cooldown.svelte';

	let activeUrl = $derived(page.url.pathname);
</script>

<header>
	<Navbar>
		<NavBrand href="/"><HomeOutline class="text-black dark:text-white" /></NavBrand>

		{#if page.url.pathname.includes('/game')}
			<div class="flex justify-center">
				<ActionCooldown></ActionCooldown>
			</div>
		{/if}

		<NavUl {activeUrl}>
			{#if userStore.user?.is_anonymous}
				<Alert color="red">
					<span class="text-lg font-medium">Attention: Anonymous login!</span>
					<p>
						You're playing with an anonymous session. When you logout or clear your browser's cache,
						you will lose your identity and you have to start again
					</p>
				</Alert>
			{/if}

			<NavLi href="/">Home</NavLi>

			{#if user.user != null}
				{#if user.user.role === 'admin'}
					<NavLi href="/admin">Admin Lounge</NavLi>
					<NavLi href="/admin/point">Point Overview</NavLi>
				{/if}
				<NavLi data-sveltekit-preload-data="off" href="/logout">Logout</NavLi>
			{:else}
				<NavLi href="/login">Login</NavLi>
				<NavLi href="/register">Register</NavLi>
			{/if}
		</NavUl>

		<div class="flex items-center md:order-2">
			{#if user.user != null && user.user.role === 'admin'}
				<RunTick />
			{/if}
			<DarkMode />
			<NavHamburger />
		</div>
	</Navbar>
</header>
