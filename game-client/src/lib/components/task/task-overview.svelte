<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/supabase/game/game.svelte';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import type { TaskType } from '../../../types/alias';

	const {
		chosenPoint
	}: {
		chosenPoint: PointState;
	} = $props();

	const possibleTasks: TaskType[] = $derived.by(() => {
		if (chosenPoint.state.point?.acquired_by == null) {
			return ['claim'];
		}

		if (chosenPoint.state.point?.acquired_by === user.user?.faction) {
			return ['repair'];
		}

		if (chosenPoint.state.point?.acquired_by !== user.user?.faction) {
			return ['attack', 'attack_and_claim'];
		}

		return [];
	});

	async function preformAction(type: TaskType): Promise<void> {
		if (game.game != null) {
			goto(`/game/puzzle?type=${type}&pointId=${chosenPoint.state.mappingid}`);
		}
	}
</script>

<section class="flex justify-center gap-5">
	{#each possibleTasks as task (task)}
		<button
			class="btn btn-primary btn-xl"
			onclick={() => preformAction(task)}
			disabled={!user.user?.canUseAction}
		>
			{#if task == 'attack'}
				Attack
			{:else if task === 'attack_and_claim'}
				Attack and Claim
			{:else if task === 'claim'}
				Claim
			{:else if task === 'repair'}
				Repair
			{/if}
		</button>
	{/each}
</section>
