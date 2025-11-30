<script lang="ts">
	import { selectedPoint } from '$lib/point/selected-point.svelte';
	import Claimable from './claimable.svelte';
	import Minigame from './minigame.svelte';
</script>

{#if selectedPoint?.selectedPoint?.state.point?.type === 'claimable'}
	<Claimable />
{:else if selectedPoint?.selectedPoint?.state.point?.type === 'mini_game'}
	<Minigame />
{/if}
