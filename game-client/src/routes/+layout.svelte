<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import { destroy, init } from '$lib/supabase/game/game.svelte';
	import { DarkMode } from 'flowbite-svelte';

	let { children } = $props();

	onMount(() => {
		init();
		console.log('init');
	});

	onDestroy(() => {
		destroy();
		console.log('destroy');
	});
</script>

<DarkMode/>

{@render children()}


