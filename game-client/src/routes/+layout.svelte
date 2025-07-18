<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import { destroy, init as gameInit } from '$lib/supabase/game/game.svelte';
	import { init as tickTaskInit } from '$lib/supabase/tick_task/tick-task.svelte';
	import Header from '$lib/components/header.svelte';

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

<Header></Header>

{@render children()}
