import type { Database } from '../../../types/database.types';
import { supabase } from '../db.svelte';

export default {
	async get(id: string): Promise<Database['public']['Tables']['fraction']['Row'] | undefined> {
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
