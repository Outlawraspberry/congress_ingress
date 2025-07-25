import { SupabaseClient } from "@supabase/supabase-js";
import { Point } from "./point.ts";
import { Database } from "../../../../types/database.types.ts";

export async function getPoint(
  supabaseClient: SupabaseClient<Database>,
  pointId: string,
): Promise<Point> {
  const pointResult = await supabaseClient.from("point").select("*").filter(
    "id",
    "eq",
    pointId,
  );

  if (pointResult.error) {
    throw pointResult.error;
  }

  if (pointResult.data.length < 1) {
    throw new Error(`Point with ID "${pointId}" not found`);
  }

  const { point, error } = Point.fromRecord(pointResult.data[0]);
  if (error) {
    throw error;
  }

  return point as Point;
}
