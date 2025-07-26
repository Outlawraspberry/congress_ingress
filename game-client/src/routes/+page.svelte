<script lang="ts">
	import { goto } from '$app/navigation';
	import Login from '$lib/login/Login.svelte';
	import { signOut, userStore } from '$lib/supabase/db.svelte';
	import { Button, P } from 'flowbite-svelte';
</script>

<section class="my-5">
	{#if userStore.session == null}
		<Login />
	{:else}
		<P class="text-center">Welcome, you can play the game!</P>

		<section class="my-5 flex justify-center gap-5">
			<Button onclick={() => goto('/game')}>Start the game</Button>

			<Button
				onclick={() => {
					signOut();
				}}>Logout</Button
			>
		</section>
	{/if}
</section>
