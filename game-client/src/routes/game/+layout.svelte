<script lang="ts">
	import UserApInformation from '$lib/components/user-ap-information.svelte';
	import { destroySelectedPoint } from '$lib/point/selected-point.svelte';
	import { onDestroy } from 'svelte';

	const { children } = $props();

	onDestroy(() => {
		destroySelectedPoint();
	});
</script>

<a href="/user">
	<UserApInformation class="mb-5 md:hidden" />
</a>

{@render children()}
