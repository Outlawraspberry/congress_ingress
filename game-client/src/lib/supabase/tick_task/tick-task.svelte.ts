import { type TaskType, type TickTask } from '../../../../../types/alias';
import { supabase, userStore } from '../db.svelte';
import { game, gameWritable } from '../game/game.svelte';
import points from '../game/points';
import user from '../user/user';

export const userTaskTick: {
	task:
		| {
				point: { name: string };
				type: TaskType;
				tick: number;
		  }
		| undefined;
} = $state({ task: undefined });

export async function init(): Promise<void> {
	const { data, error } = await supabase
		.from('tick_task')
		.select('point (name), type, tick')
		.filter('created_by', 'eq', userStore.user?.id)
		.filter('tick', 'eq', game.game?.tick);

	if (error != null) throw error;

	userTaskTick.task = data[0];
	console.log(`created_by=eq.${userStore.user?.id}`);

	supabase
		.channel(`your-task-${userStore.user?.id}`)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'tick_task',
				filter: `created_by=eq.${userStore.user?.id}`
			},
			async (payload) => {
				console.log('insert', payload);
				userTaskTick.task = {
					point: { name: await points.getPointName(payload.new.point) },
					type: payload.new.type,
					tick: payload.new.tick
				};
			}
		)
		.on(
			'postgres_changes',
			{
				event: 'UPDATE',
				schema: 'public',
				table: 'tick_task',
				filter: `created_by=eq.${userStore.user?.id}`
			},
			async (payload) => {
				userTaskTick.task = {
					point: { name: await points.getPointName(payload.new.point) },
					type: payload.new.type,
					tick: payload.new.tick
				};
			}
		)
		.subscribe();

	gameWritable.subscribe((game) => {
		if (userTaskTick.task?.tick != game?.tick) {
			userTaskTick.task = undefined;
		}
	});
}
