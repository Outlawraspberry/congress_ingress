import { ErrorResult } from "../../../types/error-code.ts";
import { corsHeaders } from "../cors.ts";

export function handleError(
  { message, errorCode, httpStatus }: ErrorResult,
): Response {
  console.error(message);

  return new Response(
    JSON.stringify({
      message,
      errorCode,
    }),
    {
      status: httpStatus,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
