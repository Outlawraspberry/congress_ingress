import type { RealtimeChannel } from '@supabase/supabase-js';
import { type Game } from '../../../types/alias';
import { supabase } from '../db.svelte';
import { writable, type Writable } from 'svelte/store';

export const game: { game: Game | null } = $state({ game: null });

export const gameWritable: Writable<Game | null> = writable(null);

let realtimeChannel: RealtimeChannel | undefined = undefined;

export async function init(): Promise<void> {
	if (game.game == null) {
		game.game = await getGame();
		gameWritable.set(game.game);
	}

	realtimeChannel = supabase
		.channel('game_channel')
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'game', filter: 'id=eq.1' },
			(payload) => {
				if (game.game != null) {
					if ('state' in payload.new) {
						game.game.state = payload.new.state;
					}

					gameWritable.set(game.game);
				}
			}
		)
		.subscribe();
}

export async function destroy(): Promise<void> {
	realtimeChannel?.unsubscribe();
	game.game = null;
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
