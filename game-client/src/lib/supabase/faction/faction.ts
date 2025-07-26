import type { Faction } from '../../../types/alias';
import { supabase } from '../db.svelte';

const fetchedFactions: Map<string, Faction> = new Map();
const fetchedNames: Map<string, string> = new Map();

export default {
	async get(id: string): Promise<Faction | undefined> {
		try {
			let fraction = fetchedFactions.get(id);

			if (fraction != null) return fraction;

			const { data, error } = await supabase
				.schema('public')
				.from('faction')
				.select('*')
				.filter('id', 'eq', id);

			if (error != null) {
				throw error;
			}

			if (data != null) {
				fraction = data[0];
				fetchedFactions.set(id, fraction);
				return fraction;
			}
		} catch {
			return undefined;
		}
	},

	async getName(id: string): Promise<string | undefined> {
		try {
			let name: string | undefined = fetchedNames.get(id);

			if (name != null) return name;

			const { data, error } = await supabase.from('faction').select('name').filter('id', 'eq', id);

			if (error != null) {
				throw error;
			}

			if (data != null) {
				name = data[0].name;
				fetchedNames.set(id, name);
				return name;
			}
		} catch {
			return undefined;
		}
	}
};
