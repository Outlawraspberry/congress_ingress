import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Point } from "./point.ts";
import { Database } from "../../../../types/database.types.ts";

export async function getAllPoints(
  supabaseClient: SupabaseClient<Database>,
): Promise<Point[]> {
  const { data, error } = await supabaseClient.rpc(
    "get_all_points_for_current_tick",
  );

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    throw new Error("Points are not in an array!");
  }

  const points: Point[] = [];

  for (const entry of data) {
    const { point, error } = Point.fromRecord(entry);
    if (error) {
      throw error;
    }

    points.push(point as Point);
  }

  return points;
}
