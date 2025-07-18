import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../types/database.types.ts";
import { handleError } from "./error.ts";

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
    throw handleError(userResponse.error);
  }

  const roleResponse = await supabaseClient.from("user").select("role")
    .filter("id", "eq", userResponse.data.user?.id);
  if (roleResponse.error) {
    throw handleError(userResponse.error);
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
