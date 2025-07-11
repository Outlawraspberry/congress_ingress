import type { Database } from '../../../types/database.types';
import { supabase } from '../db.svelte';

export default {
	async all(): Promise<Array<Database['public']['Tables']['point']['Row']>> {
		const { data, error } = await supabase.schema('public').from('point').select('*');

		if (error != null) {
			throw error;
		}
		if (data != null) {
			return data;
		}

		return [];
	}
};
