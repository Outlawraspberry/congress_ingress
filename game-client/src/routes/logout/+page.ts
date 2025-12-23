import { goto } from '$app/navigation';
import { signOut, userStore } from '$lib/supabase/db.svelte';

export const load = () => {
	if (!userStore.user?.is_anonymous) {
		signOut();
		goto('/');
	}
};
