import { C3NavService } from '$lib/c3-nav/c3-nav-servier';
import { init as supabaseInit } from '$lib/supabase/db.svelte';
import { init as gameInit } from '$lib/supabase/game/game.svelte';
import { init as userInit } from '$lib/supabase/user/user.svelte';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async () => {
	await supabaseInit();
	await gameInit();
	await userInit();
	await C3NavService.instance.init();
};
