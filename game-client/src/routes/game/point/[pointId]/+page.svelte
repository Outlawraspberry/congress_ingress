<script lang="ts">
	import { AngleLeftOutline } from 'flowbite-svelte-icons';
	import {
		Button,
		Heading,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { Game, Point, TickPoint, User } from '../../../../types/alias';
	import { game } from '$lib/supabase/game/game.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import fraction from '$lib/supabase/fraction/fraction';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import user from '$lib/supabase/user/user';
	import CurrentTask from '$lib/components/task/current-task.svelte';

	const { data }: { data: { pointId: string; point: Point; game: Game } } = $props();

	let fractionName = $state('Unclaimed');
	let tickPoint: TickPoint | null = $state(null);
	let realtimeChannel: RealtimeChannel | undefined = undefined;
	let histroy: {
		tick: number;
		health: number;
		acquired_by: string | null;
	}[] = $state([]);
	let you: User | undefined = $state(undefined);

	$effect(() => {
		if (tickPoint?.acquired_by) {
			fraction.getName(tickPoint.acquired_by).then((name) => {
				if (name) fractionName = name;
			});
		} else {
			fractionName = 'Unclaimed';
		}
	});

	onDestroy(() => {
		realtimeChannel?.unsubscribe();
	});

	onMount(async () => {
		const result = await supabase.rpc('select_point_at_current_tick', {
			p_point_id: data.pointId
		});

		if (result.error != null) throw result.error;

		tickPoint = result.data as TickPoint;

		realtimeChannel = supabase
			.channel(`point_channel_${data.pointId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'tick_point',
					filter: `point_id=eq.${data.pointId}`
				},
				(payload) => {
					tickPoint = payload.new as TickPoint;
				}
			)
			.subscribe();

		const historyResult = await supabase
			.from('tick_point')
			.select('tick, health, acquired_by')
			.filter('point_id', 'eq', data.pointId)
			.filter('tick', 'lte', game.game?.tick)
			.order('tick', {
				ascending: false
			})
			.limit(100);

		if (historyResult.error) throw historyResult.error;

		histroy = historyResult.data;

		you = await user.you();
	});
</script>

<Heading class="text-center" tag="h1">{data.point.name}</Heading>

<section class="my-5">
	<P class="text-center">Acquired by: {fractionName}</P>
	<P class="text-center">Health: {tickPoint?.health} / {data.point.max_health}</P>
</section>

<section class="container my-5 flex justify-center">
	{#if tickPoint != null && you != null}
		<TaskOverview currentTickPoint={tickPoint} user={you} chosenPoint={data.point}></TaskOverview>
	{/if}
</section>

{#if you?.role === "admin"}
	
<section class="my-5">
	<Heading tag="h2" class="text-center">History</Heading>

	<Table>
		<TableHead>
			<TableHeadCell>Tick</TableHeadCell>
			<TableHeadCell>Health</TableHeadCell>
			<TableHeadCell>Acquired by</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each histroy as entry}
				<TableBodyRow>
					<TableBodyCell>{entry.tick}</TableBodyCell>
					<TableBodyCell>{entry.health}</TableBodyCell>
					<TableBodyCell
						>{#if entry.acquired_by}
							{entry.acquired_by}
						{:else}
							None
						{/if}</TableBodyCell
					>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</section>
{/if}
