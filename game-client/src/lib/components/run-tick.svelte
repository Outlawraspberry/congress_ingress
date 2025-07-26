<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import { game } from '$lib/supabase/game/game.svelte';
	import { Button, Spinner } from 'flowbite-svelte';

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

<Button onclick={onClick} disabled={game.game?.state === 'paused'}>
	{#if loading}
		<Spinner size="4" class="mr-4" />Creating snapshot
	{:else}
		Create point snapshot
	{/if}
</Button>
