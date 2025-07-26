<script lang="ts">
	import { P } from 'flowbite-svelte';
	import { user } from '$lib/supabase/user/user.svelte';
</script>

<P>
	{#if user.user?.canUseActionInSeconds == null}
		Action free
	{:else}
		Next action in {user.user?.canUseActionInSeconds}{/if}
</P>
