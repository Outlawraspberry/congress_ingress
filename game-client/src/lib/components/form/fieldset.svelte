<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<fieldset class="fieldset rounded-box dark:bg-base-100 bg-base-200 p-4">
	{@render children()}
</fieldset>
