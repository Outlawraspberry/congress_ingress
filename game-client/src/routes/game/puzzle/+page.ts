import { goto } from '$app/navigation';
import { supabase } from '$lib/supabase/db.svelte';

export const load = async ({ url }) => {
	const pointId = url.searchParams.get('pointId');
	const type = url.searchParams.get('type');

	if (pointId == null) {
		throw new Error('pointId parameter is mandatory, but not provided.');
	}

	if (type == null) {
		throw new Error('type parameter is mandatory, but not provided.');
	}

	const { data, error } = await supabase.functions.invoke('puzzle-generator');

	if (error) throw error;

	goto(`/game/puzzle/${data.id}?puzzle=${JSON.stringify(data)}&pointId=${pointId}&type=${type}`);
};
