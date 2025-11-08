import { Json } from "../../../../../types/database.types.ts";
import { PuzzleGenerator } from "../index.ts";
import {
  fromUnknown,
  generateEmpty,
  isSolved,
  LightsOffField,
  toggle,
} from "./field/field.ts";

type Difficulty = "easy" | "medium" | "hard";

interface Move {
  row: number;
  col: number;
}

interface LightsOffResult {
  moves: Move[];
}

export class LightsOffGenerator implements PuzzleGenerator {
  private difficulty: Difficulty;
  private minMoves: number;
  private maxMoves: number;

  constructor(difficulty: Difficulty = "medium") {
    this.difficulty = difficulty;

    // Set move ranges based on difficulty
    switch (difficulty) {
      case "easy":
        this.minMoves = 3;
        this.maxMoves = 7;
        break;
      case "medium":
        this.minMoves = 8;
        this.maxMoves = 12;
        break;
      case "hard":
        this.minMoves = 13;
        this.maxMoves = 18;
        break;
    }
  }

  /**
   * Generates a new Lights Off puzzle with its solution
   * Uses reverse engineering: starts with empty field and applies random moves
   * The resulting field is guaranteed to be solvable by applying the same moves
   */
  generate(): { result: Json; puzzle: Json } {
    // Determine number of moves for this puzzle
    const numMoves = this.randomInt(this.minMoves, this.maxMoves);

    // Start with an empty field
    let field = generateEmpty();

    // Generate random moves and apply them
    const moves: Move[] = [];
    const usedPositions = new Set<string>();

    for (let i = 0; i < numMoves; i++) {
      // Generate a random position
      // To ensure better distribution, we allow some repetition but prefer unique positions
      let row: number, col: number, posKey: string;
      let attempts = 0;

      do {
        row = this.randomInt(0, 4);
        col = this.randomInt(0, 4);
        posKey = `${row},${col}`;
        attempts++;
      } while (usedPositions.has(posKey) && attempts < 10);

      // Mark position as used (but allow reuse after many attempts)
      if (attempts < 10) {
        usedPositions.add(posKey);
      }

      // Apply the move
      field = toggle(field, row, col);
      moves.push({ row, col });
    }

    // Return the puzzle and solution
    return {
      puzzle: field as unknown as Json,
      result: { moves } as unknown as Json,
    };
  }

  /**
   * Validates that a given result (solution) correctly solves the puzzle
   *
   * @param input Object containing puzzle and result
   * @returns true if the result solves the puzzle, false otherwise
   * @throws Error if the input format is invalid
   */
  isValid(input: { result: Json; puzzle: Json }): boolean {
    // Validate puzzle structure
    if (input.puzzle == null || typeof input.puzzle !== "object") {
      throw new Error("Puzzle input is null or isn't an object!");
    }

    // Validate puzzle is a valid LightsOffField using fromUnknown
    let puzzleField: LightsOffField;
    try {
      puzzleField = fromUnknown(input.puzzle);
    } catch (error) {
      throw new Error(`Invalid puzzle field: ${(error as Error).message}`);
    }

    // Validate result structure
    if (input.result == null || typeof input.result !== "object") {
      throw new Error("Result input is null or isn't an object!");
    }

    const result = input.result as Record<string, unknown>;

    // Validate moves property exists
    if (!("moves" in result)) {
      throw new Error("Result must have a 'moves' property");
    }

    if (!Array.isArray(result.moves)) {
      throw new Error("Result.moves must be an array");
    }

    // Validate each move
    for (let i = 0; i < result.moves.length; i++) {
      const move = result.moves[i];

      if (typeof move !== "object" || move === null) {
        throw new Error(`Move at index ${i} is not an object`);
      }

      if (!("row" in move) || typeof move.row !== "number") {
        throw new Error(
          `Move at index ${i} is missing 'row' property or it's not a number`,
        );
      }

      if (!("col" in move) || typeof move.col !== "number") {
        throw new Error(
          `Move at index ${i} is missing 'col' property or it's not a number`,
        );
      }

      // Validate coordinates are in bounds
      if (move.row < 0 || move.row >= 5 || move.col < 0 || move.col >= 5) {
        throw new Error(
          `Move at index ${i} has invalid coordinates: row=${move.row}, col=${move.col}`,
        );
      }
    }

    // Apply the moves to the puzzle and check if it results in a solved state
    let currentField = puzzleField;
    const moves = result.moves as Move[];

    for (const move of moves) {
      currentField = toggle(currentField, move.row, move.col);
    }

    // Check if the puzzle is solved after applying all moves
    return isSolved(currentField);
  }

  /**
   * Generates a random integer between min and max (inclusive)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
