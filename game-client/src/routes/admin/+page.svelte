<script lang="ts">
	import { Button, Card, Heading, P } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
</script>

<Section divClass="my-5 flex justify-center gap-5">
	<Card class="p-5">
		<Heading tag="h4">Game Management</Heading>

		<P>From here, you can manage the state of the game.</P>

		<Button class="mt-2" href="/admin/game">Visit</Button>
	</Card>

	<Card class="p-5">
		<Heading tag="h4">Point Management</Heading>

		<P>From here, you can manage all points of the game.</P>

		<Button class="mt-2" href="/admin/point">Visit</Button>
	</Card>
</Section>
