<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import type { Point, TaskType, TickPoint, TickTask, User } from '../../../types/alias';
	import { supabase } from '$lib/supabase/db.svelte';
	import { game } from '$lib/supabase/game/game.svelte';

	const {
		user,
		currentTickPoint = $bindable(),
		chosenPoint
	}: {
		currentTickPoint: TickPoint;
		user: User;
		chosenPoint: Point;
	} = $props();

	const possibleTasks: TaskType[] = $derived.by(() => {
		const tasks: TaskType[] = [];

		if (currentTickPoint.acquired_by == null) {
			return ['claim'];
		}

		if (currentTickPoint.acquired_by === user.fraction) {
			return ['repair'];
		}

		if (currentTickPoint.acquired_by !== user.fraction) {
			return ['attack', 'attack_and_claim'];
		}

		return [];
	});

	async function upsertTask(type: TaskType): Promise<void> {
		if (game.game != null) {
			const { error } = await supabase
				.from('tick_task')
				.upsert({
					created_by: user.id,
					point: chosenPoint.id,
					tick: game.game?.tick,
					type,
					created_at: new Date().toISOString()
				})
				.filter('created_by', 'eq', user.id);

			if (error != null) {
				throw error;
			}
		}
	}
</script>

<section>
	{#each possibleTasks as task}
		<Button onclick={() => upsertTask(task)}>
			{#if task == 'attack'}
				Attack
			{:else if task === 'attack_and_claim'}
				Attack and Claim
			{:else if task === 'claim'}
				Claim
			{:else if task === 'repair'}
				Repair
			{/if}
		</Button>
	{/each}
</section>
