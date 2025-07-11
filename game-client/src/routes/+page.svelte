<script>
	import { userStore, signOut } from '$lib/login/db.svelte';
	import Login from '$lib/login/Login.svelte';

	let user = userStore;
</script>

{#if user.user != null && user.session != null}
	Logged in!

	<button onclick={signOut}>Logout</button>
{:else}
	<Login />
{/if}
