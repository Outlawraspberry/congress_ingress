<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
	import { A, Heading, P } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
</script>

<Section>
	<Heading>Game overview</Heading>

	{#if user.user == null}
		<P>
			Before you can start, please <A href="/register">register</A> or <A href="/login">login</A>
		</P>
	{/if}

	<P class="mt-2">At the moment, there is nothing to see here.</P>
	<P class="mt-2"
		>To play the game, you have to look for Congress Quest QR codes. With help of the QR codes, you
		can play the game!</P
	>
</Section>
