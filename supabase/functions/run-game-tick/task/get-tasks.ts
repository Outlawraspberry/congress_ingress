import { TaskWithUserFraction } from "./task_with_user.ts";
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Database } from "../../../../types/database.types.ts";

export async function getAllTasks(
  supabaseClient: SupabaseClient<Database>,
): Promise<TaskWithUserFraction[]> {
  const { data, error } = await supabaseClient.rpc(
    "select_task_of_current_tick",
  );

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    throw (new Error("Tasks are not in an array!"));
  }

  const tasks: TaskWithUserFraction[] = [];

  for (const element of data) {
    const { task, error } = TaskWithUserFraction.fromRecord(element);
    if (error) {
      throw error;
    }

    tasks.push(task as TaskWithUserFraction);
  }

  return tasks;
}
