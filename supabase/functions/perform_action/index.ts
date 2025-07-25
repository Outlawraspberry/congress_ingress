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
import { UserGameData } from "../../../types/alias.ts";
import { userActionCooldownInSeconds } from "../../../types/game-config.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  let supabaseClient: SupabaseClient<Database> = createClient<Database>(
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

  const userGameData: UserGameData = userGameDataResponse.data[0];
  const now = new Date();

  if (userGameData.last_action != null) {
    const lastAction = Date.parse(userGameData.last_action);

    if (
      Math.abs(lastAction - now.getTime()) <
        userActionCooldownInSeconds * 1000
    ) {
      return error.handleError(
        new Error(
          `You are not allowed to perform the action, because you already have create an action in the last ${userActionCooldownInSeconds} seconds `,
        ),
      );
    }
  }

  point.simulateTasks(action, userGameData);

  supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const [updatePoint, insertPointArchive, userGameDataUpdateResult] =
    await Promise.all([
      supabaseClient.from("point").update({
        acquired_by: point.acquiredBy,
        health: point.health,
      }).filter("id", "eq", point.pointId),
      supabaseClient.from("actions").insert({
        created_by: userGameData.user_id,
        point: point.pointId,
        type: action.type,
      }),
      supabaseClient.from("user_game_data").update({
        last_action: now.toISOString(),
      }).filter(
        "user_id",
        "eq",
        userGameData.user_id,
      ),
    ]);

  if (updatePoint.error) return error.handleError(updatePoint.error, 400);
  if (insertPointArchive.error) {
    return error.handleError(insertPointArchive.error, 400);
  }
  if (userGameDataUpdateResult.error) {
    return error.handleError(insertPointArchive.error, 400);
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
