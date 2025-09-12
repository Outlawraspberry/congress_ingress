<script lang="ts">
	import { Button, Checkbox, Heading } from 'flowbite-svelte';
	import type { Puzzle, TaskType } from '../../../../types/alias';
	import Math from '$lib/components/puzzle/type/math/math.svelte';
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ErrorCode, type ErrorResult } from '../../../../../../types/error-code';

	const { data }: { data: { puzzle: Puzzle['Row']; pointId: string; type: TaskType } } = $props();

	const puzzle: Puzzle['Row'] = $state(data.puzzle);

	let result = '';

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
						console.log('timeout');
					} else if (errorResult.errorCode == ErrorCode.PUZZLE_INVALID_RESULT) {
						console.log('incorrect result');
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
	<Checkbox bind:checked={puzzle.solved} disabled={true}>Solved</Checkbox>
	<Checkbox bind:checked={puzzle.timeout} disabled={true}>Timeout</Checkbox>

	<Math puzzle={data.puzzle} {onResultChanged}></Math>

	{#if !puzzle.solved}
		<Button type="submit">submit</Button>
	{/if}
</form>
