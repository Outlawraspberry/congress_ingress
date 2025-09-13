import type { LayoutLoad } from "./$types";
import { init as gameInit } from "$lib/supabase/game/game.svelte";
import { init as userInit } from "$lib/supabase/user/user.svelte";
import { init as supabaseInit } from "$lib/supabase/db.svelte";

export const ssr = false;

export const load: LayoutLoad = async () => {
  await supabaseInit();
  await gameInit();
  await userInit();
};
