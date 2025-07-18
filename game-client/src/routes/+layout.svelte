<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import { destroy, game, init as gameInit } from '$lib/supabase/game/game.svelte';
	import { DarkMode } from 'flowbite-svelte';
	import { init as tickTaskInit } from '$lib/supabase/tick_task/tick-task.svelte';

	let { children } = $props();

	onMount(async () => {
		await gameInit();
		await tickTaskInit();
	});

	onDestroy(() => {
		destroy();
		console.log('destroy');
	});
</script>

<DarkMode />

{@render children()}
