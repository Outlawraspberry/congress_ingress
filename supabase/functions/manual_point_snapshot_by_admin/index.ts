// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { isUserAuthenticated } from "./authentication.ts";
import { corsHeaders } from "@cors";
import { Database } from "../../../types/database.types.ts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { error } from "@shared";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const isAuthenticated =
    authHeader.split(" ")[1] === serviceRoleKey
      ? true
      : await isUserAuthenticated(authHeader);

  if (!isAuthenticated) {
    return new Response(undefined, {
      status: 403,
      headers: { ...corsHeaders },
    });
  }

  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    serviceRoleKey,
  );

  const result = await supabaseClient.rpc("create_point_archive_snapshot");

  if (result.error != null) error.handleError(result.error);

  return new Response(undefined, {
    status: 204,
    headers: { ...corsHeaders },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/manual_tick_by_admin' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
