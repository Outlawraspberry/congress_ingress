import type { Point } from '../../../types/alias';
import { supabase } from '../db.svelte';

const nameCache = new Map<string, string>();

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
	},

	async getPointName(pointId: string): Promise<string> {
		let name = nameCache.get(pointId);

		console.log('Name', name, pointId);

		if (name == null) {
			const { data, error } = await supabase
				.from('point')
				.select('name')
				.filter('id', 'eq', pointId);

			console.log(data);
			if (error != null) throw error;
			else if (data != null && data.length > 0) {
				name = data[0].name;
				nameCache.set(pointId, name);
				return name;
			} else {
				throw new Error(`No name for point ${pointId}`);
			}
		}
		
		return name;
	}
};
