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
import { ErrorCode, ErrorResult } from "../../../types/error-code.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    await handle(req);
  } catch (e) {
    return error.errorHandler(e);
  }

  return new Response(undefined, { status: 204, headers: { ...corsHeaders } });
});

async function handle(req: Request): Promise<Response> {
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
    console.error(e);
    return new Response(JSON.stringify((e as Error).message), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = await getUserId(supabaseClient);

  // Will throw an error, so not handled here.
  await Promise.all([
    canUserPerformAction(
      supabaseClient,
      userId,
      action.point,
    ),
  ]);

  supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const response = await supabaseClient.from("actions").insert({
    created_by: userId,
    point: action.point,
    type: action.type,
    puzzle: action.puzzle,
  });

  if (response.error) {
    throw ({
      message: response.error.message,
      httpStatus: 500,
      errorCode: ErrorCode.INTERNAL_ERROR,
    }) as ErrorResult;
  }

  return new Response(undefined, { status: 204, headers: { ...corsHeaders } });
}

async function getUserId(supabase: SupabaseClient<Database>): Promise<string> {
  const userData = await supabase.auth.getUser();

  if (userData.error) {
    throw {
      errorCode: ErrorCode.AUTH_ERROR,
      httpStatus: 401,
      message: "Not authorized",
    } as ErrorResult;
  }

  return userData.data.user.id;
}

async function canUserPerformAction(
  supabase: SupabaseClient<Database>,
  userId: string,
  pointId: string,
): Promise<boolean> {
  const canUserPerform = await supabase.rpc(
    "can_user_perform_action_on_point",
    {
      a_user_id: userId,
      a_poind_id: pointId,
    },
  );

  if (canUserPerform.error) {
    throw {
      errorCode: ErrorCode.AUTH_ERROR,
      httpStatus: 401,
      message: canUserPerform.error.message,
    } as ErrorResult;
  }

  return true;
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/perform_action' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
