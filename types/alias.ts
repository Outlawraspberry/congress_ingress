import type { Database } from "./database.types.ts";

export type Faction = Database["public"]["Tables"]["faction"]["Row"];
export type Point = Database["public"]["Tables"]["point"]["Row"];
export type User = Database["public"]["Tables"]["user"]["Row"];
export type UserGameData =
  Database["public"]["Tables"]["user_game_data"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_role"]["Row"];
export type Role = Database["public"]["Enums"]["role"];
export type Game = Database["public"]["Tables"]["game"]["Row"];
export type TaskType = Database["public"]["Enums"]["task_type"];

export type Puzzle = Database["public"]["Tables"]["puzzle"];
export type PuzzleResult = Database["public"]["Tables"]["puzzle_result"];
export type PuzzleType = Database["public"]["Enums"]["puzzle-type"];
