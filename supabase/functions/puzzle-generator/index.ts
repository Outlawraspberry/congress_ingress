// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { corsHeaders } from "@cors";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../types/database.types.ts";
import { MathGenerator } from "../shared/puzzle/math-generator/math-generator.ts";
import { LightsOffGenerator } from "../shared/puzzle/lights-off/lights-off-generator.ts";
import { PuzzleGenerator } from "../shared/puzzle/puzzle-generator.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  type NewType = SupabaseClient<Database>;

  const supabaseClient: NewType = createClient<Database>(
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

  const { error, data } = await supabaseClient.auth.getUser();
  if (error != null) {
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Randomly choose between math and lights-off puzzles
  const puzzleType = Math.random() < 0.5 ? 'math' : 'lights-off';

  let generator: PuzzleGenerator;
  if (puzzleType === 'math') {
    generator = new MathGenerator();
  } else {
    // Randomly choose difficulty for lights-off
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    const difficulty = difficulties[0];
    generator = new LightsOffGenerator(difficulty);
  }

  const puzzle = generator.generate();
  const insertPuzzleResult = await supabaseClient.rpc("insert_puzzle", {
    a_user_id: data.user.id,
    a_task: puzzle.puzzle,
    a_type: puzzleType
  })

  if (insertPuzzleResult.error != null) {
    console.error(insertPuzzleResult.error)
    return createErrorResponse(insertPuzzleResult.error);
  }

  const insertPuzzleResultResult = await supabaseClient
    .from("puzzle_result")
    .insert({
      user_id: data.user.id,
      result: puzzle.result,
      id: insertPuzzleResult.data.id ?? "",
    });

  if (insertPuzzleResultResult.error != null) {
    return createErrorResponse(insertPuzzleResultResult.error);
  }

  return new Response(JSON.stringify(insertPuzzleResult.data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

function createErrorResponse(error: unknown, status: number = 400): Response {
  return new Response(JSON.stringify(error), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/puzzle-generator' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
