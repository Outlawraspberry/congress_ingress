import type { Database } from "./database.types.ts";

export type Fraction = Database["public"]["Tables"]["fraction"]["Row"];
export type Point = Database["public"]["Tables"]["point"]["Row"];
export type User = Database["public"]["Tables"]["user"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"];
export type Task = Database["public"]["Tables"]["tick_task"]["Row"];
export type TickPoint = Database["public"]["Tables"]["tick_point"]["Row"];
export type TaskType = Database["public"]["Enums"]["task_type"];
export type TickTask = Database["public"]["Tables"]["tick_task"]["Row"];
