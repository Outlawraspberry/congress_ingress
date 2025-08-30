<script lang="ts">
	import { goto } from '$app/navigation';
	import Login from '$lib/login/Login.svelte';
	import { signOut, userStore } from '$lib/supabase/db.svelte';
	import { Alert, Button, P } from 'flowbite-svelte';
</script>

<section class="my-5">
	{#if userStore.session == null}
		<Login />
	{:else}
		<P class="text-center">Welcome, you can play the game!</P>

		<section class="my-5 flex justify-center gap-5">
			<Button onclick={() => goto('/game')}>Start the game</Button>

			{#if userStore.user?.is_anonymous}
				<Alert color="red">
					<span class="text-lg font-medium">Attention: Anonymous login!</span>
					<p>
						You want to logout from an anonymous session, this means, that you cannot access it
						again after the logout!
					</p>
				</Alert>
			{/if}

			<Button
				onclick={() => {
					signOut();
				}}>Logout</Button
			>
		</section>
	{/if}
</section>
