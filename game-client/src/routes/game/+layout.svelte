<script lang="ts">
	import UserApInformation from '$lib/components/user-ap-information.svelte';
	import { destroySelectedPoint } from '$lib/point/selected-point.svelte';
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';

	const { children } = $props();

	// Check if current route is the map page
	let isMapPage = $derived($page.url.pathname === '/game/map');

	onDestroy(() => {
		destroySelectedPoint();
	});
</script>

{#if isMapPage}
	<!-- Map page: no wrapper, preserve touch interactions -->
	{@render children()}
{:else}
	<!-- Regular game pages: scrollable wrapper -->
	<div class="game-layout">
		<a href="/user">
			<UserApInformation class="mb-5 md:hidden" />
		</a>

		{@render children()}
	</div>
{/if}

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
