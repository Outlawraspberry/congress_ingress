import type { Database } from "./database.types.ts";

export type Faction = Database["public"]["Tables"]["faction"]["Row"];
export type Point = Database["public"]["Tables"]["point"]["Row"];
export type User = Database["public"]["Tables"]["user"]["Row"];
export type UserGameData = Database["public"]["Tables"]["user_game_data"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"];
export type TaskType = Database["public"]["Enums"]["task_type"];
