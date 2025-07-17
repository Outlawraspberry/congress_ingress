import { Game } from "./game.ts";

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../../types/database.types.ts";

export async function getGame(
  supabaseClient: SupabaseClient<Database>,
): Promise<Game> {
  const { data, error } = await supabaseClient.from("game").select("*").filter(
    "id",
    "eq",
    1,
  );

  if (error) {
    throw error;
  }

  return new Game(data[0]);
}
