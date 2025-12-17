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

<h1 class="mb-3 text-3xl font-bold">Legal §</h1>

<Breadcrump />

<section class="hero">
	<div class="hero-content flex-col justify-center pt-10">
		<div class="flex flex-col flex-wrap gap-5">
			{@render card('Impress', '', '/legal/impress')}

			{@render card('Data-Privacy', '', '/legal/data-privacy')}

			{@render card('GitHub', '', 'https://github.com/Outlawraspberry/congress_ingress')}
		</div>
	</div>
</section>
