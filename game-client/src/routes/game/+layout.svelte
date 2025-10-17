<script lang="ts">
	import { destroySelectedPoint } from '$lib/point/selected-point.svelte';
	import { onDestroy } from 'svelte';

	const { children } = $props();

	onDestroy(() => {
		destroySelectedPoint();
	});
</script>

{@render children()}
