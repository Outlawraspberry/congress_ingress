<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
	import { A, Button, Heading, P } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
</script>

<Section>
	<Heading>Game overview</Heading>

	{#if user.user == null}
		<P>
			Before you can start, please <A href="/register">register</A> or <A href="/login">login</A>
		</P>
	{/if}

	<P>Welcome to congress quest 2025! 🥳</P>

	<Button href="/game/point" size="xl">Start the game</Button>
</Section>
