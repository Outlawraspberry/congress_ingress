import { Json } from "../../../../types/database.types.ts";

export interface PuzzleGenerator {
  generate(): {
    result: Json;
    puzzle: Json;
  };

  isValid(input: { result: Json; puzzle: Json }): boolean;
}
