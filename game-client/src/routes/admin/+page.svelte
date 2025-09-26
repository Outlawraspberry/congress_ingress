<script lang="ts">
	import Card from '$lib/components/card.svelte';
</script>

{#snippet card(headline: string, content: string, href: string)}
	<Card>
		<h2 class="mb-3 text-2xl font-bold">{headline}</h2>

		<p class="mb-3">{content}</p>

		<a class="btn btn-primary mt-2" {href}>Visit</a>
	</Card>
{/snippet}

<section class="hero">
	<div class="hero-content flex-wrap justify-center gap-5">
		<h1 class="mb-6 text-3xl font-bold">Admin Lounge 🛋️</h1>

		{@render card(
			'Game Management',
			'From here, you can manage the state of the game.',
			'/admin/game'
		)}

		{@render card(
			'Point Management',
			'From here, you can manage all points of the game.',
			'/admin/point'
		)}
	</div>
</section>
