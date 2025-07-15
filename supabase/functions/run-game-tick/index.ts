import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../types/database.types.ts";
import { Task, TickPoint } from "../../../types/alias.ts";
import { Point } from "./point/point.ts";
import { resolve } from "node:path";

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

  const [resultGame, resultAllPoints] = await Promise.all([
    supabaseClient.from("game").select("*").filter("id", "eq", 1),
    supabaseClient.rpc(
      "get_all_points_for_current_tick",
    ),
  ]);

  if (resultGame.error != null) {
    return handleError(resultGame.error);
  }

  const game = resultGame.data[0];

  if (resultAllPoints.error != null) {
    return handleError(resultAllPoints.error);
  }

  if (!Array.isArray(resultAllPoints.data)) {
    return handleError(new Error("Expected Data is not an array"));
  }

  const points: Point[] = [];

  for (const entry of resultAllPoints.data) {
    const { point, error } = Point.fromRecord(entry);
    if (error != null) {
      handleError(error);
    }

    points.push(point as Point);
  }

  const nextTick = game.tick + 1;

  const resultinsertNewTickPoint = await supabaseClient.from("tick_point")
    .insert(points.map((point) => point.toTickPoint(nextTick)));

  if (resultinsertNewTickPoint.error) {
    return handleError(resultinsertNewTickPoint.error);
  }

  const resultUpdateGame = await supabaseClient.from("game").update({
    ...game,
    tick: nextTick,
  }).filter("id", "eq", 1);
  
  if (resultUpdateGame.error) return handleError(resultUpdateGame.error);

  return new Response(null, {
    status: 204,
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

function handleError(error: unknown) {
  console.error(error);

  return new Response(JSON.stringify(error), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/run-game-tick' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
