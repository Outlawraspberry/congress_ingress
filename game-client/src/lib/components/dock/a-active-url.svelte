<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		href,
		children,
		activeUrl,
		'data-sveltekit-preload-data': DataSelteKitPreloadData,
		setActive,
		...rest
	}: {
		href: string;
		children: Snippet;
		activeUrl: string;
		setActive?: boolean;
		'data-sveltekit-preload-data'?: 'off' | 'on';
	} = $props();
</script>

<a
	{href}
	class={setActive || href === activeUrl ? 'dock-active' : ''}
	data-sveltekit-preload-data={DataSelteKitPreloadData}
	{...rest}
>
	{@render children()}
</a>
