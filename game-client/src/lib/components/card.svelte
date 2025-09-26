<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, class: klass = '' }: { children: Snippet; class?: string } = $props();
</script>

<section
	class={`card w-96 border-spacing-x-4 rounded-lg border border-gray-200 p-5 shadow-md ${klass}`}
>
	{@render children()}
</section>
