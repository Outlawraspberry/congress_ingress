<script lang="ts">
	import { userTaskTick } from '$lib/supabase/tick_task/tick-task.svelte';
	import { Heading, P } from 'flowbite-svelte';
</script>

<Heading tag="h3">Your current task</Heading>

{#if userTaskTick.task != null}
	<P>You want to {userTaskTick.task.type} {userTaskTick.task.point.name}</P>
{:else}
	<P>You haven't placed an action yet!</P>
{/if}
