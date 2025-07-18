import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../types/database.types.ts";
import { getAllTasks } from "./task/get-tasks.ts";
import { getAllPoints } from "./point/get-points.ts";
import { getGame } from "./game/get-game.ts";
import { corsHeaders } from "../cors.ts";
import { handleError } from "./error.ts";
import { isUserAuthenticated } from "./authentication.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const isAuthenticated = authHeader.split(" ")[1] === serviceRoleKey
    ? true
    : await isUserAuthenticated(authHeader);

  if (!isAuthenticated) {
    return handleError(
      new Error("You are not allowed to perform this action!"),
      403,
    );
  }

  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
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

  if (game.state === "paused") {
    return new Response(null, {status: 200, "statusText": "Game is paused!"})
  }

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
    headers: { ...corsHeaders },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/run-game-tick' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
