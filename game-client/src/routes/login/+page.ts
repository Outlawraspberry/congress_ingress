import { userStore } from '$lib/supabase/db.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getRedirectUrl } from '$lib/redirect-url/redirect-url.svelte';
import { PUBLIC_VALID_REDIRECT_URL } from '$env/static/public';

export const load: PageLoad = async ({ url }) => {
	const redirectUrl = getRedirectUrl({
		allowedRedirectUrl: new URL(PUBLIC_VALID_REDIRECT_URL),
		currentUrl: url
	});

	if (userStore.session != null && userStore.user != null) {
		redirect(308, redirectUrl);
	}

	return { redirectUrl };
};
