import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../types/database.types.ts";
import { TaskWithUserFraction } from "./task/task_with_user.ts";
import { getAllTasks } from "./task/get-tasks.ts";
import { getAllPoints } from "./point/get-points.ts";
import { getGame } from "./game/get-game.ts";

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

  const [
    game,
    tasks,
    points,
  ] = await Promise.all([
    getGame(supabaseClient),
    getAllTasks(supabaseClient),
    getAllPoints(supabaseClient),
  ]);

  for (const point of points) {
    for (const task of tasks) {
      if (task.point === point.pointId) {
        point.simulateTasks(task);
      }
    }
  }

  const nextTick = game.tick + 1;

  const updatedPoints = points.map((point) => point.toTickPoint(nextTick));

  const resultinsertNewTickPoint = await supabaseClient.from("tick_point")
    .insert(updatedPoints);

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

function handleTask(task: TaskWithUserFraction): void {
  if (task.type === "attack") return handleAttack(task);
  if (task.type === "attack_and_claim") return handleAttackAndClaim(task);
  if (task.type === "repair") return handleRepair(task);
  if (task.type === "claim") return handleClaim(task);
}

function handleAttack(task: TaskWithUserFraction) {}

function handleAttackAndClaim(task: TaskWithUserFraction) {}

function handleRepair(task: TaskWithUserFraction) {}

function handleClaim(task: TaskWithUserFraction) {}

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
