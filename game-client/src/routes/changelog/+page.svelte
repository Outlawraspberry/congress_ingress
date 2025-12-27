<script>
	import { changes } from '$lib/changelog/changelog';
	import ChangelogSet from '$lib/changelog/changelog-set.svelte';
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
</script>

<section>
	<h1 class="text-3xl">Changelog</h1>

	<Breadcrump />

	<ChangelogSet {changes} />
</section>
