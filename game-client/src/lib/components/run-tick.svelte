<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import { game } from '$lib/supabase/game/game.svelte';

	let loading = $state(false);

	async function onClick() {
		if (game.game?.state === 'playing') {
			loading = true;
			const { error } = await supabase.functions.invoke('manual_point_snapshot_by_admin');

			if (error) {
				throw error;
			}

			loading = false;
		}
	}
</script>

<button class="btn btn-primary" onclick={onClick} disabled={game.game?.state === 'paused'}>
	{#if loading}
		<span class="loading loading-dots loading-md">Creating snapshot</span>
	{:else}
		Create point snapshot
	{/if}
</button>
