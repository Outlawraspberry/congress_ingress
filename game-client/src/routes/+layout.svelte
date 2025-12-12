<script lang="ts">
	import Header from '$lib/components/header/header.svelte';
	import { destroy as gameDestroy } from '$lib/supabase/game/game.svelte';
	import { destroy as userDestroy } from '$lib/supabase/user/user.svelte';
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import Dock from '$lib/components/dock/dock.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		darkMode = event.matches;
		document.documentElement.classList.toggle('dark', darkMode);
	});

	// Optionally: initialize on load
	document.documentElement.classList.toggle('dark', darkMode);

	// Check if current route is the map page
	let isMapPage = $derived($page.url.pathname === '/game/map');

	onMount(async () => {});

	onDestroy(() => {
		gameDestroy();
		userDestroy();
	});
</script>

<Header class="hidden md:block"></Header>

<!-- Map page: no scrollable wrapper, let map handle its own layout -->
<!-- Regular pages: wrap in scrollable container -->
{#if isMapPage}
	{@render children()}
{:else}
	<div class="main-content">
		<div class="container mx-auto max-w-full p-6">
			{@render children()}
		</div>
	</div>
{/if}

<Dock class="md:hidden" />

<style>
	.main-content {
		min-height: 100vh;
		min-height: 100dvh;
		width: 100vw;
		max-width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
	}

	/* Ensure proper scrolling on mobile */
	@media (max-width: 768px) {
		.main-content {
			padding-bottom: 5rem; /* Space for dock at bottom */
		}
	}

	/* Prevent horizontal overflow */
	:global(body) {
		overflow-x: hidden;
		width: 100%;
		max-width: 100vw;
	}

	:global(html) {
		overflow-x: hidden;
		max-width: 100vw;
	}
</style>
