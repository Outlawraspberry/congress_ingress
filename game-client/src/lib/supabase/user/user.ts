import { supabase } from '$lib/supabase/db.svelte';
import type { User } from '../../../types/alias';

export default {
	async you(): Promise<User | undefined> {
		const { data, error } = await supabase.schema('public').from('user').select('*');

		if (error != null) {
			throw error;
		}
		if (data != null) {
			return data[0];
		}
	}
};
