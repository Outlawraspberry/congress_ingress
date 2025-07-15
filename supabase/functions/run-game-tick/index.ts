import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../types/database.types.ts";
import { Task, TickPoint } from "../../../types/alias.ts";
import { Point } from "./point/point.ts";

type TaskReduzed = Pick<Task, "type" | "created_by" | "point">;

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";

  const supabaseClient = createClient<Database>(
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

  const { data, error } = await supabaseClient.rpc(
    "get_all_points_for_current_tick",
  );

  if (error != null) {
    console.error(error);

    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(data)) {
    return new Response("Expected Data is not an array", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const points = data.map((entry) => Point.fromRecord(entry));

  console.log(points);

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});

function handleTask(task: Task): void {
  if (task.type === "attack") return handleAttack(task);
  if (task.type === "attack_and_claim") return handleAttackAndClaim(task);
  if (task.type === "repair") return handleRepair(task);
  if (task.type === "claim") return handleClaim(task);
}

function handleAttack(task: Task) {}

function handleAttackAndClaim(task: Task) {}

function handleRepair(task: Task) {}

function handleClaim(task: Task) {}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/run-game-tick' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
