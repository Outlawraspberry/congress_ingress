<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import type { Database } from '../../types/database.types';

	const {
		data
	}: {
		data: {
			user: Database['public']['Tables']['user']['Row'];
			fraction: Database['public']['Tables']['fraction']['Row'];
		};
	} = $props();
</script>

<Heading tag="h1">Game</Heading>

<P>Welcome {data.user.name}.</P>
<P>Your fraction {data.fraction.name}.</P>
