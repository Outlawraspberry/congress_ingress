<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<fieldset class="fieldset rounded-box dark:bg-base-100 bg-base-200 w-full p-4 sm:w-md">
	{@render children()}
</fieldset>
