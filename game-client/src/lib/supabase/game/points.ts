import type { Point } from '../alias';
import { supabase } from '../db.svelte';

export default {
	async all(): Promise<Array<Point>> {
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
