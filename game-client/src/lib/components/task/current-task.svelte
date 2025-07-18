<script lang="ts">
	import { userTaskTick } from '$lib/supabase/tick_task/tick-task.svelte';

	const taskTypeTranslated = $derived.by(() => {
		if (userTaskTick.task?.type === 'attack') {
			return 'Attack';
		} else if (userTaskTick.task?.type === 'attack_and_claim') {
			return 'Attack and Claim';
		} else if (userTaskTick.task?.type === 'claim') {
			return 'Claim';
		} else if (userTaskTick.task?.type === 'repair') {
			return 'Repair';
		} else {
			return 'No Task';
		}
	});
</script>

Task:
{#if userTaskTick.task != null}
	{taskTypeTranslated} {userTaskTick.task.point.name}
{:else}
	{taskTypeTranslated}
{/if}
