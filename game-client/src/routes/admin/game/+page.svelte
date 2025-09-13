<script lang="ts">
	import { game } from '$lib/supabase/game/game.svelte';
	import { P } from 'flowbite-svelte';
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
