<script>
	import { userStore, signOut } from '$lib/login/db.svelte';
	import Login from '$lib/login/Login.svelte';
	import { P, Button } from 'flowbite-svelte';

	let user = userStore;
</script>

{#if user.user != null && user.session != null}
	<P>Logged in!</P>

	<Button onclick={signOut}>Logout</Button>
{:else}
	<Login />
{/if}
