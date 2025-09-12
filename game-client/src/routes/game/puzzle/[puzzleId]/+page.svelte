<script lang="ts">
	import { Alert, Button, Checkbox, Heading } from 'flowbite-svelte';
	import type { Puzzle, TaskType } from '../../../../types/alias';
	import Math from '$lib/components/puzzle/type/math/math.svelte';
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ErrorCode, type ErrorResult } from '../../../../../../types/error-code';

	const { data }: { data: { puzzle: Puzzle['Row']; pointId: string; type: TaskType } } = $props();

	const puzzle: Puzzle['Row'] = $state(data.puzzle);

	let result = $state('');
	let incorrectResult: boolean = $state(false);

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
						puzzleId: puzzle.id,
						result
					}
				});

				if (puzzleSolveError != null) {
					const errorResult: ErrorResult = await resp?.json();
					if (errorResult.errorCode == ErrorCode.PUZZLE_TIMEOOUT) {
						puzzle.timeout = true;
					} else if (errorResult.errorCode == ErrorCode.PUZZLE_INVALID_RESULT) {
						incorrectResult = true;
					}
					return;
				}
				puzzle.solved = true;

				const { error: performActionError } = await supabase.functions.invoke<string>(
					'perform_action',
					{
						body: {
							user: userStore.user?.id,
							point: data.pointId,
							type: data.type,
							puzzleId: puzzle.id
						}
					}
				);

				if (performActionError != null) {
					console.log(d, resp);
				} else {
					goto(`/game/point/${data.pointId}`);
				}
			} catch (e) {
				if (e) console.error(e);
			}
		}
	}
</script>

<Heading tag="h2">{puzzle.id}</Heading>

<form onsubmit={onSubmit}>
	{#if puzzle.solved}
		<Alert color="green">
			<span class="font-medium">The puzzle is solved!</span>
			Congratulations, you've solved the puzzle!
		</Alert>
	{/if}

	{#if puzzle.timeout}
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

	<Math puzzle={data.puzzle} {onResultChanged}></Math>

	{#if !puzzle.solved && !puzzle.timeout}
		<Button type="submit">submit</Button>
	{/if}
</form>
