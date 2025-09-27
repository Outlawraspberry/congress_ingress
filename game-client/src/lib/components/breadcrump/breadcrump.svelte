<script lang="ts">
	import { page } from '$app/state';
	import LiActiveUrl from '../header/li-active-url.svelte';
	import { pathnameToCrumps } from './pathname-to-crumps';

	const crumps = $derived(pathnameToCrumps(page.url.pathname));
</script>

<div class="breadcrumbs text-sm">
	<ul>
		{#each crumps as crump (crump.href)}
			<LiActiveUrl href={crump.href} activeUrl={page.url.pathname}>
				{crump.name}
			</LiActiveUrl>
		{/each}
	</ul>
</div>
