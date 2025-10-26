<script lang="ts">
	const { children } = $props();
</script>

<fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-4">
	{@render children()}
</fieldset>
