<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	const { children, class: clazz }: { children: Snippet; class: ClassValue } = $props();
</script>

<fieldset class={` fieldset rounded-box dark:bg-base-100 bg-base-200 p-4 ${clazz}`}>
	{@render children()}
</fieldset>
