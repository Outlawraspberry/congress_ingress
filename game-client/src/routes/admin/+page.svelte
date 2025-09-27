<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
</script>

{#snippet card(headline: string, content: string, href: string)}
	<Card>
		<h2 class="mb-3 text-2xl font-bold">{headline}</h2>

		<p class="mb-3">{content}</p>

		<a class="btn btn-primary mt-2" {href}>Visit</a>
	</Card>
{/snippet}

<h1 class="mb-3 text-3xl font-bold">Admin Lounge 🛋️</h1>

<Breadcrump />

<section class="hero">
	<div class="hero-content flex-col justify-center pt-10">
		<div class="flex flex-col flex-wrap gap-5">
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
	</div>
</section>
