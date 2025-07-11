import type { Fraction } from '../alias';
import { supabase } from '../db.svelte';

export default {
	async get(id: string): Promise<Fraction | undefined> {
		try {
			const { data, error } = await supabase
				.schema('public')
				.from('fraction')
				.select('*')
				.filter('id', 'eq', id);

			if (error != null) {
				throw error;
			}

			if (data != null) {
				return data[0];
			}
		} catch {
			return undefined;
		}
	}
};
