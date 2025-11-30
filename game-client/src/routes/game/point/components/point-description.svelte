<script lang="ts">
	import { selectedPoint } from '$lib/point/selected-point.svelte';
	import type { ClassValue } from 'svelte/elements';
	import Claimable from './claimable.svelte';
	import Minigame from './minigame.svelte';

	let props: { class?: ClassValue } = $props();
</script>

<section class={['block', props.class]}>
	{#if selectedPoint?.selectedPoint?.state.point?.type === 'claimable'}
		<Claimable />
	{:else if selectedPoint?.selectedPoint?.state.point?.type === 'mini_game'}
		<Minigame />
	{/if}
</section>
