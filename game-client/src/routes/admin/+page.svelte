<script lang="ts">
	import { resolve } from '$app/paths';
	import { game } from '$lib/supabase/game/game.svelte';
	import { Button, P } from 'flowbite-svelte';
</script>

<section class="my-5">
	<P class="text-center"
		>The game is: {#if game.game?.state === 'paused'}
			Paused
		{:else}
			Running
		{/if}</P
	>
</section>

<section class="container">
	<Button href={resolve('/admin/point-overview')}>Point Overview</Button>
</section>
