import { ErrorCode, ErrorResult } from "../../../types/error-code.ts";
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

export function errorHandler(e: unknown): Response {
  let content: string;
  let status: number = 500;

  if (typeof e !== "object" || e == null) {
    return handleError({
      errorCode: ErrorCode.INTERNAL_ERROR,
      httpStatus: status,
      message: "Unknown error",
    });
  }

  if (
    "status" in e &&
    typeof e.status === "number"
  ) {
    status = e.status;
  }

  if (
    "message" in e &&
    typeof e.message === "string"
  ) {
    content = e.message;
  } else if (e instanceof Error) {
    content = e.message;
  } else {
    content = JSON.stringify(e);
  }

  return handleError({
    errorCode: ErrorCode.INTERNAL_ERROR,
    httpStatus: status,
    message: content,
  });
}
