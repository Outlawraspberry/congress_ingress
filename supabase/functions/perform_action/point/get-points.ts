import { SupabaseClient } from "@supabase/supabase-js";
import { Point } from "./point.ts";
import { Database } from "../../../../types/database.types.ts";

export async function getPoint(
  supabaseClient: SupabaseClient<Database>,
  mappingId: string,
): Promise<Point> {
  const pointId = await supabaseClient.from("point_mapping").select(
    "point_id",
  ).filter("id", "eq", mappingId);

  const pointResult = await supabaseClient.from("point").select("*").filter(
    "id",
    "eq",
    pointId.data[0].point_id,
  );

  console.log(pointId.data, pointResult.data, pointResult.data[0]);

  if (pointResult.error) {
    throw pointResult.error;
  }

  if (pointResult.data.length < 1) {
    throw new Error(`Point with ID "${mappingId}" not found`);
  }

  const { point, error } = Point.fromRecord(pointResult.data[0]);
  if (error) {
    throw error;
  }

  return point as Point;
}
