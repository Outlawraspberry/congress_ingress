<script lang="ts">
	import type { PuzzleMath } from '$lib/puzzles/math';
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

<div class="join">
	<input
		class="join-item input"
		value={`${task.leftHandle} ${task.operator} ${task.rightHandle} =`}
		disabled={true}
	/>
	<input
		class="join-item input"
		type="number"
		onchange={() => {
			onResultChanged(result);
		}}
		bind:value={result}
		placeholder="Type your result"
	/>
</div>
