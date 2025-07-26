<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { destroy as gameDestroy, init as gameInit } from '$lib/supabase/game/game.svelte';
	import { destroy as userDestroy, init as userInit } from '$lib/supabase/user/user.svelte';
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';
	import { init as supabaseInit } from '$lib/supabase/db.svelte';

	let { children } = $props();

	onMount(async () => {
		await supabaseInit();
		await gameInit();
		await userInit();
	});

	onDestroy(() => {
		gameDestroy();
		userDestroy();
	});
</script>

<Header></Header>

<div class="container mx-auto">
	{@render children()}
</div>
