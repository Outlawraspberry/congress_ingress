import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types.ts";
import { error } from "@shared";

export async function isUserAuthenticated(
  authHeader: string,
): Promise<boolean> {
  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    },
  );

  const userResponse = await supabaseClient.auth.getUser();

  if (userResponse.error) {
    throw error.handleError(userResponse.error);
  }

  const roleResponse = await supabaseClient.from("user_role").select(
    "role",
  )
    .filter("user_id", "eq", userResponse.data.user?.id);

  if (roleResponse.error) {
    throw error.handleError(userResponse.error);
  }

  if (
    !(
      roleResponse.data != null && roleResponse.data.length > 0 &&
      roleResponse.data[0].role === "admin"
    )
  ) {
    return false;
  }

  return true;
}
