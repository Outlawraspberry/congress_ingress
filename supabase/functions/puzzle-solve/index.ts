// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { error } from "@shared";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types.ts";
import { ErrorCode } from "../../../types/error-code.ts";
import { corsHeaders } from "@cors";
import { MathGenerator } from "../shared/puzzle/math-generator/math-generator.ts";
import { LightsOffGenerator } from "../shared/puzzle/lights-off/lights-off-generator.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    return await handle(req);
  } catch (e) {
    return error.errorHandler(e);
  }
});

async function handle(req: Request): Promise<Response> {
  const json: unknown = await req.json();

  if (json == null || typeof json !== "object") {
    return error.handleError({
      message: "The input is null or not from type object.",
      errorCode: ErrorCode.PUZZLE_TIMEOOUT,
      httpStatus: 400,
    });
  }

  if (!("puzzle" in json && typeof json.puzzle === "string")) {
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
    .select("id (id, expires_at, type, task), user_id, created_at, result")
    .filter("user_id", "eq", userResponse.data.user.id)
    .filter("id", "eq", json.puzzle);

  if (
    puzzleResultResult.error != null || puzzleResultResult.data.length === 0
  ) {
    return error.handleError({
      errorCode: ErrorCode.RESOURCE_NOT_FOUND,
      message: puzzleResultResult.error?.message ?? "Puzzle not found",
      httpStatus: 404,
    });
  }

  const expireTime = new Date(puzzleResultResult.data[0].id.expires_at).getTime();
  const now = Date.now();

  if (now >= expireTime) {
    return error.handleError({
      message:
        "The time to solve the puzzle is up. Please create a new puzzle.",
      httpStatus: 400,
      errorCode: ErrorCode.PUZZLE_TIMEOOUT,
    });
  }

  // Get puzzle type and task from the puzzle table
  const puzzleData = puzzleResultResult.data[0].id;
  const puzzleType = puzzleData.type;
  const puzzleTask = puzzleData.task;

  // Validate the result based on puzzle type
  let isValidResult = false;
  try {
    if (puzzleType === 'math') {
      const mathGenerator = new MathGenerator();
      isValidResult = mathGenerator.isValid({
        puzzle: puzzleTask,
        result: json.result
      });
    } else if (puzzleType === 'lights-off') {
      const lightsOffGenerator = new LightsOffGenerator();
      isValidResult = lightsOffGenerator.isValid({
        puzzle: puzzleTask,
        result: json.result
      });
    } else {
      return error.handleError({
        message: `Unknown puzzle type: ${puzzleType}`,
        httpStatus: 400,
        errorCode: ErrorCode.INVALID_INPUT,
      });
    }
  } catch (validationError) {
    return error.handleError({
      message: `Validation error: ${(validationError as Error).message}`,
      httpStatus: 400,
      errorCode: ErrorCode.PUZZLE_INVALID_RESULT,
    });
  }

  if (!isValidResult) {
    return error.handleError({
      message: "The solution is incorrect, please try again",
      httpStatus: 400,
      errorCode: ErrorCode.PUZZLE_INVALID_RESULT,
    });
  }

  const updateResult = await supabaseClient
    .from("puzzle")
    .update({
      solved: true,
    })
    .filter("id", "eq", json.puzzle);

  if (updateResult.error != null) throw updateResult.error;

  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/puzzle_solve' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
