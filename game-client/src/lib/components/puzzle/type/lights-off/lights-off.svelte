<script lang="ts">
	import type { LightsOffPuzzle, LightsOffMove } from '$lib/puzzles/lights-off';
	import type { Puzzle } from '../../../../../types/alias';
	import LightCell from './light-cell.svelte';

	const {
		puzzle,
		onResultChanged,
		onSolved,
		isSubmitting
	}: {
		puzzle: Puzzle['Row'];
		onResultChanged: (result: string) => void;
		onSolved?: () => void;
		isSubmitting?: boolean;
	} = $props();

	const task: LightsOffPuzzle = puzzle.task as unknown as LightsOffPuzzle;

	// Create a deep copy of the initial field state
	let currentField: boolean[][] = $state(task.field.map((row) => [...row]));

	// Track all moves made by the user
	let moves: LightsOffMove[] = $state([]);

	// Toggle a light and its neighbors
	function toggleLight(row: number, col: number) {
		// Create a new array to trigger reactivity
		const newField = currentField.map((r) => [...r]);

		// Toggle the clicked cell
		newField[row][col] = !newField[row][col];

		// Toggle adjacent cells (up, down, left, right)
		const neighbors = [
			[row - 1, col], // up
			[row + 1, col], // down
			[row, col - 1], // left
			[row, col + 1] // right
		];

		for (const [r, c] of neighbors) {
			if (r >= 0 && r < 5 && c >= 0 && c < 5) {
				newField[r][c] = !newField[r][c];
			}
		}

		currentField = newField;
		moves = [...moves, { row, col }];

		// Send the moves as result
		onResultChanged(JSON.stringify({ moves }));
	}

	// Check if puzzle is solved (all lights off)
	const isSolved = $derived(currentField.every((row) => row.every((cell) => !cell)));

	// Track previous solved state to detect when puzzle becomes solved
	let wasSolved = $state(false);

	// Auto-submit when puzzle is solved
	$effect(() => {
		if (isSolved && !wasSolved && onSolved) {
			wasSolved = true;
			// Submit immediately to prevent timeout issues
			onSolved();
		} else if (!isSolved) {
			wasSolved = false;
		}
	});

	// Reset the puzzle
	function resetPuzzle() {
		currentField = task.field.map((row) => [...row]);
		moves = [];
		onResultChanged('');
	}
</script>

<div
	class="bg-base-100 rounded-box mx-auto flex max-w-2xl flex-col items-center gap-6 p-8 shadow-lg"
>
	<h2 class="text-center text-2xl font-bold">Lights Off Puzzle</h2>

	<!-- Game Status -->
	<div class="flex w-full items-center justify-between">
		<div class="text-sm">
			<span class="font-semibold">Moves:</span>
			<span class="badge badge-primary badge-lg ml-2">{moves.length}</span>
		</div>
		<button type="button" class="btn btn-outline btn-sm" onclick={resetPuzzle}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
			Reset
		</button>
	</div>

	<!-- Lights Grid -->
	<div class="w-full max-w-md">
		<div class="bg-base-200 grid grid-cols-5 gap-2 rounded-lg p-4">
			{#each currentField as row, rowIndex (rowIndex)}
				{#each row as isOn, colIndex (`${rowIndex}-${colIndex}`)}
					<LightCell {isOn} row={rowIndex} col={colIndex} onToggle={toggleLight} />
				{/each}
			{/each}
		</div>
	</div>

	<!-- Win Message -->
	{#if isSolved}
		<div role="alert" class="alert alert-success">
			{#if isSubmitting}
				<span class="loading loading-spinner loading-md"></span>
				<div>
					<p class="font-semibold">Puzzle solved in {moves.length} moves!</p>
					<p class="text-sm">Submitting your solution...</p>
				</div>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>All lights are off! Puzzle solved in {moves.length} moves!</span>
			{/if}
		</div>
	{/if}

	<!-- Instructions -->
	<div class="text-center text-sm opacity-70">
		<p class="mb-2 font-semibold">How to play:</p>
		<p>Click any light to toggle it and its adjacent neighbors (up, down, left, right).</p>
		<p>Turn all lights off to solve the puzzle!</p>
	</div>
</div>
