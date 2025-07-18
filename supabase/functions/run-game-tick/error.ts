import { corsHeaders } from "../cors.ts";

export function handleError(error: unknown, status: number = 500) {
  console.error(error);

  return new Response(JSON.stringify(error), {
    status: status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
