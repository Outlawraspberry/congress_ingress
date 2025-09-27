<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	import RunTick from '$lib/components/run-tick.svelte';
	import { game } from '$lib/supabase/game/game.svelte';
</script>

<section class="my-5">
	<h1 class="text-3xl">Game Overview</h1>

	<Breadcrump />

	<Card>
		<p class="mb-3 text-center">
			The game is: {#if game.game?.state === 'paused'}
				Paused
			{:else}
				Running
			{/if}
		</p>

		<RunTick></RunTick>
	</Card>
</section>
