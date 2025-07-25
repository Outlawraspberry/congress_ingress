// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "@cors";
import { Action, isActionValid } from "./action/action.ts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types.ts";
import { error } from "@shared";
import { getPoint } from "./point/get-points.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
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

  const action: Action = await req.json();

  try {
    isActionValid(action);
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const [userGameDataResponse, point] = await Promise.all([
    supabaseClient.from("user_game_data")
      .select("*"),
    getPoint(supabaseClient, action.point),
  ]);

  if (userGameDataResponse.error != null) {
    return error.handleError(userGameDataResponse.error, 403);
  }

  const userGameData = userGameDataResponse.data[0];

  point.simulateTasks(action, userGameData);

  const [updatePoint, insertPointArchive] = await Promise.all([
    supabaseClient.from("point").update({
      acquired_by: point.acquiredBy,
      health: point.health,
    }).filter("id", "eq", point.pointId),
    supabaseClient.from("point_tick_archive").insert({
      point_id: point.pointId,
      acquired_by: point.acquiredBy,
      created_at: new Date().toISOString(),
      health: point.health,
    }),
  ]);

  if (updatePoint.error) return error.handleError(updatePoint.error);
  if (insertPointArchive.error) {
    return error.handleError(insertPointArchive.error);
  }

  return new Response(
    undefined,
    { status: 204, headers: { ...corsHeaders } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/perform_action' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
