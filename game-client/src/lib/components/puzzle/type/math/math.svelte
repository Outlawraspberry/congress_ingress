<script lang="ts">
	import type { PuzzleMath } from '$lib/puzzles/math';
	import { ButtonGroup, Input } from 'flowbite-svelte';
	import type { Puzzle } from '../../../../../types/alias';

	let result: string = $state('');

	const {
		puzzle,
		onResultChanged
	}: {
		puzzle: Puzzle['Row'];
		onResultChanged: (result: string) => void;
	} = $props();

	const task: PuzzleMath = puzzle.task as PuzzleMath;
</script>

});

<ButtonGroup>
	<Input
		size="lg"
		value={`${task.leftHandle} ${task.operator} ${task.rightHandle} =`}
		disabled={true}
	/>
	<Input
		size="lg"
		type="number"
		onchange={() => {
			onResultChanged(result);
		}}
		bind:value={result}
		placeholder="Type your result"
		autofocus
	/>
</ButtonGroup>
