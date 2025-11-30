<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/supabase/game/game.svelte';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import type { TaskType } from '../../../types/alias';
	import { performAction, getActionPointCost } from '$lib/supabase/actions';

	let isPerformingAction = $state(false);
	let actionError = $state<string | null>(null);
	let actionCosts = $state<Partial<Record<TaskType, number>>>({});

	const {
		chosenPoint
	}: {
		chosenPoint: PointState;
	} = $props();

	// Only allow actions if point type is claimable
	const isClaimable = chosenPoint.state.point?.type === 'claimable';
	const isMiniGame = chosenPoint.state.point?.type === 'mini_game';

	const possibleTasks: TaskType[] = $derived.by(() => {
		if (!isClaimable) return [];
		if (chosenPoint.state.point?.acquired_by == null) {
			return ['claim'];
		}

		if (chosenPoint.state.point?.acquired_by === user.user?.faction) {
			const tasks: TaskType[] = ['repair'];

			// Add upgrade if conditions are met
			const point = chosenPoint.state.point;
			const maxLevel = game.game?.max_point_level ?? 3;
			const canUpgrade = point.health === point.max_health && point.level < maxLevel;

			if (canUpgrade) {
				tasks.push('upgrade');
			}

			return tasks;
		}

		if (chosenPoint.state.point?.acquired_by !== user.user?.faction) {
			return ['attack', 'attack_and_claim'];
		}

		return [];
	});

	// Load action costs when component mounts
	async function loadActionCosts() {
		for (const task of possibleTasks) {
			try {
				actionCosts[task] = await getActionPointCost(task);
			} catch (error) {
				console.warn(`Failed to load cost for ${task}:`, error);
			}
		}
	}

	// Load costs when possible tasks change
	$effect(() => {
		if (possibleTasks.length > 0) {
			loadActionCosts();
		}
	});

	async function preformAction(type: TaskType): Promise<void> {
		if (!chosenPoint.state.point?.id) {
			actionError = 'Point not available';
			return;
		}

		if (!user.user?.id) {
			actionError = 'User not authenticated';
			return;
		}

		console.log(
			'Performing action:',
			type,
			'for user:',
			user.user.id,
			'on point:',
			chosenPoint.state.point.id
		);

		isPerformingAction = true;
		actionError = null;

		try {
			// Check if user can afford the action using store data
			const requiredAP = actionCosts[type] || 0;
			if (user.user.actionPoints < requiredAP) {
				actionError = `Not enough Action Points for this action (need ${requiredAP}, have ${user.user.actionPoints})`;
				return;
			}

			// Perform the action
			await performAction({
				type,
				point: chosenPoint.state.point.id
			});

			// Action successful - could add success feedback here
			console.log(`Successfully performed ${type} action`);
		} catch (error) {
			console.error('Action failed:', error);
			actionError = error instanceof Error ? error.message : 'Action failed';
		} finally {
			isPerformingAction = false;
		}
	}

	async function solvePuzzle(): Promise<void> {
		if (game.game != null) {
			goto('/game/puzzle');
		}
	}
</script>

{#if isClaimable}
	<section class="flex flex-col items-center gap-3">
		{#if actionError}
			<div class="alert alert-error">
				{actionError}
			</div>
		{/if}

		<div class="flex justify-center gap-5">
			{#each possibleTasks as task (task)}
				<button
					class="btn btn-primary btn-xl"
					onclick={() => preformAction(task)}
					disabled={!user.user?.canUseAction ||
						isPerformingAction ||
						(user.user && actionCosts[task] != null && user.user.actionPoints < actionCosts[task])}
				>
					{#if isPerformingAction}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					<div class="flex flex-col items-center">
						{#if task == 'attack'}
							Attack
						{:else if task === 'attack_and_claim'}
							Attack and Claim
						{:else if task === 'claim'}
							Claim
						{:else if task === 'repair'}
							Repair
						{:else if task === 'upgrade'}
							Upgrade Point
						{/if}
						{#if actionCosts[task]}
							<span class="text-xs opacity-70">({actionCosts[task]} AP)</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</section>
{:else if isMiniGame}
	<section class="flex justify-center gap-5">
		<button
			class="btn btn-primary btn-xl"
			onclick={() => solvePuzzle()}
			disabled={!user.user?.canUseAction}
		>
			Solve Puzzle
		</button>
	</section>
{:else}
	<div class="alert alert-warning">This point cannot be claimed or interacted with.</div>
{/if}
