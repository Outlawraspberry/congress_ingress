// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { error } from "@shared";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types.ts";
import { ErrorCode } from "../../../types/error-code.ts";
import { assertEquals } from "@std/assert";
import { corsHeaders } from "@cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json: unknown = await req.json();

  if (json == null || typeof json !== "object") {
    return error.handleError({
      message: "The input is null or not from type object.",
      errorCode: ErrorCode.PUZZLE_TIMEOOUT,
      httpStatus: 400,
    });
  }

  if (!("puzzleId" in json && typeof json.puzzleId === "string")) {
    return error.handleError(
      {
        message: "Puzzle not found",
        httpStatus: 404,
        errorCode: ErrorCode.RESOURCE_NOT_FOUND,
      },
    );
  }

  if (!("result" in json && json.result != null)) {
    return error.handleError({
      httpStatus: 400,
      message: "Missing result",
      errorCode: ErrorCode.INVALID_INPUT,
    });
  }

  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const authHeader = req.headers.get("Authorization") ?? "";
  const userResponse = await supabaseClient.auth.getUser(
    authHeader.split(" ")[1],
  );

  if (userResponse.error != null) {
    return error.handleError({
      errorCode: ErrorCode.AUTH_ERROR,
      message: userResponse.error.message,
      httpStatus: 500,
    });
  }

  const puzzleResultResult = await supabaseClient
    .from("puzzle_result")
    .select("*")
    .filter("user_id", "eq", userResponse.data.user.id)
    .filter("id", "eq", json.puzzleId);

  if (
    puzzleResultResult.error != null || puzzleResultResult.data.length === 0
  ) {
    return error.handleError({
      errorCode: ErrorCode.RESOURCE_NOT_FOUND,
      message: puzzleResultResult.error?.message ?? "Puzzle not found",
      httpStatus: 404,
    });
  }

  const createTime = new Date(puzzleResultResult.data[0].created_at).getTime();
  const now = Date.now();

  if (now - createTime >= 10000) {
    const timeoutResult = await supabaseClient
      .from("puzzle")
      .update({
        timeout: true,
      })
      .filter("id", "eq", json.puzzleId);

    if (timeoutResult.error) {
      return error.handleError({
        message: timeoutResult.error.message,
        httpStatus: 400,
        errorCode: ErrorCode.PUZZLE_TIMEOOUT,
      });
    }

    return error.handleError({
      message:
        "The time to solve the puzzle is up. Please create a new puzzle.",
      httpStatus: 400,
      errorCode: ErrorCode.PUZZLE_TIMEOOUT,
    });
  }

  try {
    assertEquals(puzzleResultResult.data[0].result, json.result);
  } catch {
    return error.handleError(
      {
        message: "The results are not equal, please try it again",
        httpStatus: 400,
        errorCode: ErrorCode.PUZZLE_INVALID_RESULT,
      },
    );
  }

  const updateResult = await supabaseClient
    .from("puzzle")
    .update({
      solved: true,
    })
    .filter("id", "eq", json.puzzleId);

  if (updateResult.error != null) return error.handleError(updateResult.error);

  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/puzzle_solve' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
