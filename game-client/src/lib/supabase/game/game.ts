import type { Game } from '../alias';
import { supabase } from '../db.svelte';

export default {
	async getGame(): Promise<Game> {
		const { data, error } = await supabase.from('game').select('*').filter('id', 'eq', '1');

		if (error != null) {
			throw error;
		}

		if (data == null) {
			throw new Error('Game could not be found!');
		}

		return data[0];
	}
};
