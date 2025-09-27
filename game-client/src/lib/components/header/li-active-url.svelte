<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: klass,
		href,
		activeUrl,
		children,
		...rest
	}: { class?: string; href: string; activeUrl: string; children: Snippet } = $props();
</script>

<li class={`${activeUrl === href ? 'font-bold' : 'font-normal'} ${klass}`} {...rest}>
	<a {href}>{@render children()}</a>
</li>
