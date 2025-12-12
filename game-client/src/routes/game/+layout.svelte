<script lang="ts">
	import UserApInformation from '$lib/components/user-ap-information.svelte';
	import { destroySelectedPoint } from '$lib/point/selected-point.svelte';
	import { onDestroy } from 'svelte';

	const { children } = $props();

	onDestroy(() => {
		destroySelectedPoint();
	});
</script>

<div class="game-layout">
	<a href="/user">
		<UserApInformation class="mb-5 md:hidden" />
	</a>

	{@render children()}
</div>

<style>
	.game-layout {
		min-height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.game-layout {
			padding-bottom: 1rem;
		}
	}
</style>
