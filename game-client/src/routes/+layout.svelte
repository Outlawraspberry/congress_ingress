<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/header.svelte';
	import { destroy as gameDestroy, game, init as gameInit } from '$lib/supabase/game/game.svelte';
	import {
		init as tickTaskInit,
		destroy as tickTaskDestroy
	} from '$lib/supabase/tick_task/tick-task.svelte';

	let { children } = $props();

	onMount(async () => {
		await gameInit();
		await tickTaskInit();
	});

	onDestroy(() => {
		gameDestroy();
		tickTaskDestroy();
	});
</script>

<Header></Header>

{@render children()}
