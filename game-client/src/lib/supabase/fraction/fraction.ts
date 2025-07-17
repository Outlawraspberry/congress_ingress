import type { Fraction } from '../../../types/alias';
import { supabase } from '../db.svelte';

const fetchedFractions: Map<string, Fraction> = new Map();
const fetchedNames: Map<string, string> = new Map();

export default {
	async get(id: string): Promise<Fraction | undefined> {
		try {
			let fraction = fetchedFractions.get(id);

			if (fraction != null) return fraction;

			const { data, error } = await supabase
				.schema('public')
				.from('fraction')
				.select('*')
				.filter('id', 'eq', id);

			if (error != null) {
				throw error;
			}

			if (data != null) {
				fraction = data[0];
				fetchedFractions.set(id, fraction);
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

			const { data, error } = await supabase.from('fraction').select('name').filter('id', 'eq', id);

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
