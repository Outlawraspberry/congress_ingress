import { userStore } from '$lib/supabase/db.svelte';
import { user } from '$lib/supabase/user/user.svelte';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	await parent();

	if (
		userStore.session == null ||
		userStore.user == null ||
		(user.user != null && user.user.role !== 'admin')
	) {
		redirect(308, '/login?wasRedirected');
	}
};
