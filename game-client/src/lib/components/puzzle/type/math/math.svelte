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

	function handleInput() {
		onResultChanged(result);
	}

	// Get operator symbol for display
	const operatorSymbol =
		task.operator === 'add'
			? '+'
			: task.operator === 'subtract'
				? '−'
				: task.operator === 'multiply'
					? '×'
					: task.operator === 'divide'
						? '÷'
						: task.operator;
</script>

<div
	class="bg-base-100 rounded-box mx-auto flex max-w-lg flex-col items-center gap-6 p-8 shadow-lg"
>
	<h2 class="text-center text-2xl font-bold">Math Puzzle</h2>

	<div class="flex w-full flex-col items-center gap-4">
		<!-- Math Expression Display -->
		<div class="bg-base-200 rounded-box w-full p-6">
			<div class="text-primary space-x-4 text-center font-mono text-4xl font-bold">
				<span class="inline-block min-w-[80px] text-right">{task.leftHandle}</span>
				<span class="text-accent">{operatorSymbol}</span>
				<span class="inline-block min-w-[80px] text-left">{task.rightHandle}</span>
				<span class="text-accent">=</span>
				<span class="text-secondary">?</span>
			</div>
		</div>

		<!-- Input Section -->
		<div class="w-full max-w-xs">
			<label class="label" for="math-result">
				<span class="label-text font-semibold">Your Answer:</span>
			</label>
			<input
				id="math-result"
				class="input input-bordered input-lg w-full text-center font-mono text-2xl"
				type="number"
				oninput={handleInput}
				bind:value={result}
				placeholder="?"
				autocomplete="off"
			/>
		</div>
	</div>

	<!-- Instructions -->
	<div class="text-center text-sm opacity-70">
		<p>Solve the math problem above and enter your answer</p>
	</div>
</div>
