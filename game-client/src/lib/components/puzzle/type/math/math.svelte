<script lang="ts">
	import { Button, ButtonGroup, Input, Spinner } from 'flowbite-svelte';
	import type { Puzzle } from '../../../../../types/alias';
	import { supabase } from '$lib/supabase/db.svelte';

	const { puzzle }: { puzzle: Puzzle } = $props();
	const task: {
		leftHandle: number;
		rightHandle: number;
		operator: string;
	} = puzzle.task;

	let result: number | undefined = $state();
	let isSubmittingResult = $state(false);

	async function onSubmit(): Promise<void> {
		if (result != null) {
			console.log(result);

			try {
				const res = await supabase.functions.invoke('puzzle-solve', {
					body: {
						puzzleId: puzzle.id,
						result
					}
				});
				console.log('The result is correct!');
			} catch (e) {
				if (e) console.error(e);
			}
		}
	}
</script>

<form class="flex" onsubmit={onSubmit}>
	<ButtonGroup>
		<Input
			size="lg"
			value={`${task.leftHandle} ${task.operator} ${task.rightHandle} =`}
			disabled={true}
		/>
		<Input size="lg" type="number" bind:value={result} placeholder="Type your result" autofocus />

		<Button type="submit"
			>{#if isSubmittingResult}
				<Spinner /> Validating result
			{:else}
				Submit Result
			{/if}</Button
		>
	</ButtonGroup>
</form>
