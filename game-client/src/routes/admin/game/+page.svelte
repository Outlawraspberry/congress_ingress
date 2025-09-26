<script lang="ts">
	import Card from '$lib/components/card.svelte';
	import { game } from '$lib/supabase/game/game.svelte';
</script>

<section class="my-5">
	<h1 class="text-3xl">Game Overview</h1>

	<Card
		><p class="text-center">
			The game is: {#if game.game?.state === 'paused'}
				Paused
			{:else}
				Running
			{/if}
		</p></Card
	>
</section>
