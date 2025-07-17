import type { RealtimeChannel } from '@supabase/supabase-js';
import { type Game } from '../../../types/alias';
import { supabase } from '../db.svelte';

export const game: { game: Game | null } = $state({ game: null });

let realtimeChannel: RealtimeChannel | undefined = undefined;

export async function init(): Promise<void> {
	if (game.game == null) {
		game.game = await getGame();
	}

	realtimeChannel = supabase
		.channel('custom-update-channel')
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'game', filter: 'id=eq.1' },
			(payload) => {
				console.log('update', payload);
				if (game.game != null) {
					if ('state' in payload.new) {
						game.game.state = payload.new.state;
					}
					if ('tick' in payload.new) {
						game.game.tick = payload.new.tick;
					}
				}
			}
		)
		.subscribe();

	console.log(realtimeChannel);
}

export async function destroy(): Promise<void> {
	realtimeChannel?.unsubscribe();
}

async function getGame(): Promise<Game> {
	const { data, error } = await supabase.from('game').select('*').filter('id', 'eq', '1');

	if (error != null) {
		throw error;
	}

	if (data == null) {
		throw new Error('Game could not be found!');
	}

	return data[0];
}
