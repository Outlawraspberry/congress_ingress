import { userStore } from '$lib/supabase/db.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (userStore.session == null && userStore.user == null) {
		redirect(308, '/login');
	}
};
