<script lang="ts">
	import { goto } from '$app/navigation';
	import Math from '$lib/components/puzzle/type/math/math.svelte';
	import { selectedPuzzle } from '$lib/puzzle/selected-puzzle.svelte';
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import { Alert, Button, Heading, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { ErrorCode, type ErrorResult } from '../../../../../types/error-code';

	let result = $state('');
	let incorrectResult: boolean = $state(false);

	const puzzle = selectedPuzzle.selectedPuzzle!;
	const pointUrl = `/game/point/${puzzle.state.pointId}`;

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

	async function onSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();

		if (result != null && result != '') {
			try {
				incorrectResult = false;

				const {
					error: puzzleSolveError,
					data: d,
					response: resp
				} = await supabase.functions.invoke('puzzle-solve', {
					body: {
						puzzleId: puzzle.state.puzzle.id,
						result
					}
				});

				if (puzzleSolveError != null) {
					const errorResult: ErrorResult = await resp?.json();
					if (errorResult.errorCode == ErrorCode.PUZZLE_TIMEOOUT) {
						puzzle.state.puzzle.timeout = true;
					} else if (errorResult.errorCode == ErrorCode.PUZZLE_INVALID_RESULT) {
						incorrectResult = true;
					}
					return;
				}
				puzzle.state.puzzle.solved = true;

				const { error: performActionError } = await supabase.functions.invoke<string>(
					'perform_action',
					{
						body: {
							user: userStore.user?.id,
							point: puzzle.state.pointId,
							type: puzzle.state.actionType,
							puzzleId: puzzle.state.puzzle.id
						}
					}
				);

				if (performActionError != null) {
					console.log(d, resp);
				} else {
					console.log(pointUrl);
					goto(pointUrl);
				}
			} catch (e) {
				if (e) console.error(e);
			}
		}
	}
</script>

<Heading class="text-center" tag="h2">{puzzle.state.puzzle.id}</Heading>

<form class="container" onsubmit={onSubmit}>
	<section class="mt-2 mb-2">
		{#if puzzle.state.puzzle.solved}
			<Alert color="green">
				<span class="font-medium">The puzzle is solved!</span>
				Congratulations, you've solved the puzzle!
			</Alert>
		{/if}

		{#if puzzle.state.puzzle.timeout}
			<Alert color="red">
				<span class="font-medium">The time for your puzzle is up!</span>
				You took too long to solve the puzzle. Sorry, you have to try it again! :/
			</Alert>
		{/if}

		{#if incorrectResult}
			<Alert color="red">
				<span class="font-medium">Incorrect result!</span>
				{#if result != '42'}
					Your submitted result was not correct. Please try it again.
				{:else}
					42 is the anwser to everything, but not in this case.
				{/if}
			</Alert>
		{/if}
	</section>

	<P>
		{puzzle.state.secondsUntilTimeout}
	</P>

	<section class="mt-2 mb-2 flex justify-center">
		<Math puzzle={puzzle.state.puzzle} {onResultChanged}></Math>

		{#if !puzzle.state.puzzle.solved && !puzzle.state.puzzle.timeout}
			<Button type="submit">Submit result</Button>
		{/if}
	</section>
</form>

<section class="container flex justify-center">
	{#if puzzle.state.puzzle.timeout || puzzle.state.puzzle.solved}
		<Button href={pointUrl}>Back to Point</Button>
	{/if}
</section>
