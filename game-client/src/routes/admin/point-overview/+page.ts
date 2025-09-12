import { supabase, userStore } from '$lib/supabase/db.svelte';
import { user } from '$lib/supabase/user/user.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (
		userStore.session == null ||
		userStore.user == null ||
		(user.user != null && user.user.role !== 'admin')
	) {
		redirect(308, '/');
	}

	const points = await supabase.from('point').select('id,name');
	if (points.error) throw points.error;

	return { points: points.data };
};
