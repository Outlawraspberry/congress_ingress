<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
</script>

<p>
	{#if user.user?.canUseActionInSeconds == null}
		Action free
	{:else}
		Next action in {user.user?.canUseActionInSeconds}{/if}
</p>
