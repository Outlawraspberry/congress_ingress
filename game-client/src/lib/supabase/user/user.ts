import { supabase } from '$lib/supabase/db.svelte';
import type { Database } from '../../../types/database.types';

export default {
	async you(): Promise<Database['public']['Tables']['user']['Row'] | undefined> {
		const { data, error } = await supabase.schema('public').from('user').select('*');

		console.log(data, error);
		if (error != null) {
			throw error;
		}
		if (data != null) {
			return data[0];
		}
	}
};
