import { createClient, type Session, type User } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { destroy as userDestroy, init as userInit } from './user/user.svelte';
import type { Database } from '@lucide/svelte';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		storage: window.localStorage,
		persistSession: true,
		autoRefreshToken: true
	}
});

export const userStore: {
	user: User | undefined;
	session: Session | undefined;
} = $state({
	user: undefined,
	session: undefined
});

export async function init() {
	const [userResponse, sessionResponse] = await Promise.all([
		supabase.auth.getUser(),
		supabase.auth.getSession()
	]);
	const user = userResponse.data != null ? userResponse.data.user : undefined;
	const session = sessionResponse.data != null ? sessionResponse.data.session : undefined;

	if (session != null && user != null) {
		userStore.session = session;
		userStore.user = user;
	}
}

export async function signIn(email: string, password: string): Promise<void> {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error != null) {
		throw error;
	}

	if (data != null) {
		userStore.session = data.session;
		userStore.user = data.user;
		await userInit();
	}
}

export async function signInAnonymously(display_name: string, faction: string): Promise<void> {
	const { data, error } = await supabase.auth.signInAnonymously({
		options: {
			data: {
				display_name: display_name,
				faction_id: faction
			}
		}
	});

	if (error != null) {
		throw error;
	}

	if (data != null && data.session != null && data.user != null) {
		userStore.session = data.session;
		userStore.user = data.user;
		await userInit();
	}
}

export async function signUp({
	email,
	faction,
	password,
	display_name
}: {
	email: string;
	password: string;
	display_name: string;
	faction: string;
}): Promise<void> {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				display_name: display_name,
				faction_id: faction
			}
		}
	});

	if (error != null) {
		throw error;
	}

	if (data != null && data.session != null && data.user != null) {
		userStore.session = data.session;
		userStore.user = data.user;
		await userInit();
	}
}

export function signOut() {
	const result = supabase.auth.signOut();

	userStore.user = undefined;
	userStore.session = undefined;
	userDestroy();

	window.sessionStorage.clear();

	return result;
}
