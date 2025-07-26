<script lang="ts">
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import { game } from '$lib/supabase/game/game.svelte';
	import { Button } from 'flowbite-svelte';
	import type { TaskType } from '../../../types/alias';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { user } from '$lib/supabase/user/user.svelte';

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
			const { error } = await supabase.functions.invoke('perform_action', {
				body: {
					user: userStore.user!.id,
					point: chosenPoint.state.point?.id,
					type: type
				}
			});

			if (error != null) {
				throw error;
			}
		}
	}
</script>

<section class="flex justify-center gap-5">
	{#each possibleTasks as task (task)}
		<Button onclick={() => preformAction(task)} disabled={!user.user?.canUseAction}>
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
