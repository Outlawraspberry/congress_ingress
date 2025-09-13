import { goto } from '$app/navigation';
import { signOut } from '$lib/supabase/db.svelte';

export const load = () => {
	signOut();
	goto('/');
};
