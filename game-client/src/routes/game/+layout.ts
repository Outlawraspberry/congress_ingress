import { userStore } from '$lib/supabase/db.svelte';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	await parent();

	if (userStore.session == null || userStore.user == null) {
		redirect(308, '/login?wasRedirected');
	}
};
