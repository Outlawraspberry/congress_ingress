import { createClient, type Session, type User } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		storage: window.sessionStorage,
		persistSession: true,
		autoRefreshToken: true
	}
});

export const userStore: { user: User | undefined; session: Session | undefined } = $state({
	user: undefined,
	session: undefined
});

await init();

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
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });

	if (error != null) {
		throw error;
	}
	if (data != null) {
		userStore.session = data.session;
		userStore.user = data.user;
	}
}
export function signOut() {
	const result = supabase.auth.signOut();

	userStore.user = undefined;
	userStore.session = undefined;

	window.sessionStorage.clear();

	return result;
}
