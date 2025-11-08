<script lang="ts">
	import { goto } from '$app/navigation';
	import Math from '$lib/components/puzzle/type/math/math.svelte';
	import LightsOff from '$lib/components/puzzle/type/lights-off/lights-off.svelte';
	import { selectedPuzzle } from '$lib/puzzle/selected-puzzle.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';
	import { ErrorCode, type ErrorResult } from '../../../../../types/error-code';

	let result = $state('');
	let incorrectResult: boolean = $state(false);
	let isSubmitting = $state(false);

	const puzzle = selectedPuzzle.selectedPuzzle!;
	const pointUrl = `/game/point`;

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete('puzzle');
		goto(`?${searchParams.toString()}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	});

	function onResultChanged(newResult: string): void {
		result = newResult;
	}

	async function onSubmit(event?: SubmitEvent, autoRedirect: boolean = true): Promise<void> {
		if (event) {
			event.preventDefault();
		}

		if (isSubmitting) {
			return; // Prevent duplicate submissions
		}

		if (result != null && result != '') {
			try {
				isSubmitting = true;
				incorrectResult = false;

				const { error: puzzleSolveError, response: resp } = await supabase.functions.invoke(
					'puzzle-solve',
					{
						body: {
							puzzle: puzzle.state.puzzle.id,
							result
						}
					}
				);

				if (puzzleSolveError != null) {
					const errorResult: ErrorResult = await resp?.json();
					if (errorResult.errorCode == ErrorCode.PUZZLE_TIMEOOUT) {
						puzzle.state.isTimeout = true;
					} else if (errorResult.errorCode == ErrorCode.PUZZLE_INVALID_RESULT) {
						incorrectResult = true;
					}
					isSubmitting = false;
					return;
				}
				puzzle.state.puzzle.solved = true;

				if (autoRedirect) {
					goto(pointUrl);
				}
			} catch (e) {
				if (e) console.error(e);
				isSubmitting = false;
			}
		}
	}

	// Auto-submit handler for lights-off puzzle
	async function handleLightsOffSolved(): Promise<void> {
		// Submit immediately to prevent timeout, but don't redirect yet
		await onSubmit(undefined, false);

		// Wait for celebration if submission was successful
		if (puzzle.state.puzzle.solved) {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			goto(pointUrl);
		}
	}
</script>

<h1 class="text-3xl font-bold">{puzzle.state.puzzle.id}</h1>

<form onsubmit={onSubmit}>
	<section class="mt-2 mb-2">
		{#if puzzle.state.puzzle.solved}
			<div role="alert" class="alert alert-info" color="green">
				<span class="font-medium">The puzzle is solved!</span>
				Congratulations, you've solved the puzzle!
			</div>
		{/if}

		{#if puzzle.state.isTimeout}
			<div role="alert" class="alert alert-error" color="red">
				<p>
					<span class="font-bold">The time for your puzzle is up!</span>
					You took too long to solve the puzzle. Sorry, you have to try it again! :/
				</p>
			</div>
		{:else}
			<p>
				You have
				<span class="countdown font-mono text-xl">
					<span
						style={`--value:${puzzle.state.secondsUntilTimeout};`}
						aria-live="polite"
						aria-label={puzzle.state.secondsUntilTimeout.toString()}
						>{puzzle.state.secondsUntilTimeout}</span
					>
				</span> more seconds
			</p>
		{/if}

		{#if incorrectResult}
			<div role="alert" class="alert alert-error" color="red">
				<p>
					<span class="font-medium">Incorrect result!</span>

					{#if result != '42'}
						Your submitted result was not correct. Please try it again.
					{:else}
						42 is the anwser to everything, but not in this case.
					{/if}
				</p>
			</div>
		{/if}
	</section>

	{#if puzzle.state.puzzle.type === 'math'}
		<Math puzzle={puzzle.state.puzzle} {onResultChanged}></Math>
	{:else if puzzle.state.puzzle.type === 'lights-off'}
		<LightsOff
			puzzle={puzzle.state.puzzle}
			{onResultChanged}
			onSolved={handleLightsOffSolved}
			{isSubmitting}
		></LightsOff>
	{:else}
		<div role="alert" class="alert alert-error">
			<span>Unknown puzzle type: {puzzle.state.puzzle.type}</span>
		</div>
	{/if}

	<section class="mt-2 mb-2">
		{#if !puzzle.state.puzzle.solved && !puzzle.state.isTimeout}
			<button class="btn btn-primary" type="submit" disabled={isSubmitting}>
				{#if isSubmitting}
					<span class="loading loading-spinner loading-sm"></span>
					Submitting...
				{:else}
					Submit result
				{/if}
			</button>
		{/if}

		{#if puzzle.state.isTimeout || puzzle.state.puzzle.solved}
			<a class="btn btn-secondary" href={pointUrl} data-sveltekit-preload-data="off"
				>Back to Point</a
			>
		{/if}
	</section>
</form>
