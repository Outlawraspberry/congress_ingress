import { supabase, userStore } from '$lib/supabase/db.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (userStore.session != null && userStore.user != null) {
		redirect(308, '/');
	}

	const { data, error } = await supabase.from('faction').select('id,name');

	if (error != null) {
		throw error;
	}

	const factions = data.map((data) => {
		return { value: data.id, name: data.name };
	});

	return {
		factions
	};
};
