export const corsHeaders = {
  "Access-Control-Allow-Origin":
    Deno.env.get("CORS_ORIGIN") ?? "http://localhost:5173",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
