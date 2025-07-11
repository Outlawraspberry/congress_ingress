<script lang="ts">
	import { goto } from '$app/navigation';
	import Login from '$lib/login/Login.svelte';
	import { signOut, userStore } from '$lib/supabase/db.svelte';
	import { Button } from 'flowbite-svelte';
</script>

{#if userStore.session == null}
	<Login />
{:else}
	Welcome, you can play the game!

	<Button onclick={signOut}>Logout</Button>

	<Button onclick={() => goto('/game')}>Start the game</Button>
{/if}
