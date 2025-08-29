<script lang="ts">
	import { Checkbox, Heading } from 'flowbite-svelte';
	import type { Puzzle } from '../../../../types/alias';
	import Math from '$lib/components/puzzle/type/math/math.svelte';

	const { data }: { data: { puzzle: Puzzle } } = $props();
</script>

<Heading tag="h2">{data.puzzle.id}</Heading>

<Checkbox checked={data.puzzle.solved} disabled={true}>Solved</Checkbox>
<Checkbox checked={data.puzzle.timeout} disabled={true}>Timeout</Checkbox>

<Math puzzle={data.puzzle}></Math>
