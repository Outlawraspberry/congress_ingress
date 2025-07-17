<script lang="ts">
	import { AngleLeftOutline } from 'flowbite-svelte-icons';
	import { Button, Heading, P } from 'flowbite-svelte';
	import type { Game, Point, TickPoint } from '../../../../types/alias';
	import { game } from '$lib/supabase/game/game.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import type { RealtimeChannel } from '@supabase/supabase-js';

	const { data }: { data: { pointId: string; point: Point; game: Game } } = $props();

    let fractionName = $state("Unclaimed")
	let tickPoint: TickPoint | null = $state(null);
	let realtimeChannel: RealtimeChannel | undefined = undefined;

    $effect(() => {
        if (tickPoint?.acquired_by) {
           supabase.from("fraction").select("name").filter("id", "eq", tickPoint?.acquired_by).then(res => {
                if (res.data) fractionName = res.data[0].name;
            });
        } else {fractionName = "Unclaimed"}
    })

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
				{ event: 'INSERT', schema: 'public', table: 'tick_point', filter: `point_id=eq.${data.pointId}` },
				(payload) => {
                    tickPoint = payload.new as TickPoint;
				}
			)
			.subscribe();
	});
</script>

<Button href="/game"><AngleLeftOutline></AngleLeftOutline></Button>

<Heading tag="h1">{data.point.name}</Heading>

<P>{game.game?.tick}</P>

<P>Acquired by: {fractionName}</P>
<P>Health: {tickPoint?.health} / {data.point.max_health}</P>
