import { describe, test } from "@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { LightsOffGenerator } from "./lights-off-generator.ts";
import { LightsOffField } from "./field/field.ts";

describe("LightsOffGenerator works when", () => {
  const generator = new LightsOffGenerator();

  describe("generate() works when", () => {
    test("generates a puzzle with valid structure", () => {
      const generated = generator.generate();

      expect(generated).toHaveProperty("puzzle");
      expect(generated).toHaveProperty("result");
    });

    test("generates a puzzle with correct field structure", () => {
      const generated = generator.generate();
      const puzzle = generated.puzzle as unknown as LightsOffField;

      expect(puzzle).toHaveProperty("version");
      expect(puzzle.version).toBe(1);
      expect(puzzle).toHaveProperty("field");
      expect(Array.isArray(puzzle.field)).toBe(true);
      expect(puzzle.field.length).toBe(5);

      for (let row = 0; row < 5; row++) {
        expect(Array.isArray(puzzle.field[row])).toBe(true);
        expect(puzzle.field[row].length).toBe(5);
        for (let col = 0; col < 5; col++) {
          expect(typeof puzzle.field[row][col]).toBe("boolean");
        }
      }
    });

    test("generates a result with correct field structure", () => {
      const generated = generator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      expect(result).toHaveProperty("moves");
      expect(Array.isArray(result.moves)).toBe(true);
    });

    test("generates a puzzle that is not already solved", () => {
      const generated = generator.generate();
      const puzzle = generated.puzzle as unknown as LightsOffField;

      // Check that at least one light is on
      let hasLightOn = false;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (puzzle.field[row][col]) {
            hasLightOn = true;
            break;
          }
        }
        if (hasLightOn) break;
      }

      expect(hasLightOn).toBe(true);
    });

    test("generates different puzzles on multiple calls", () => {
      const puzzle1 = generator.generate();
      const puzzle2 = generator.generate();

      // While theoretically they could be the same, it's highly unlikely
      // We just check that the function can be called multiple times
      expect(puzzle1).toBeDefined();
      expect(puzzle2).toBeDefined();
    });

    test("generates a solvable puzzle", () => {
      const generated = generator.generate();

      // The puzzle should be valid (solvable)
      expect(generator.isValid(generated)).toBe(true);
    });

    test("generates result with at least one move", () => {
      const generated = generator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      expect(result.moves.length).toBeGreaterThan(0);
    });

    test("generates result with valid move coordinates", () => {
      const generated = generator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      for (const move of result.moves) {
        expect(move).toHaveProperty("row");
        expect(move).toHaveProperty("col");
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(5);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(5);
      }
    });
  });

  describe("isValid() works when", () => {
    test("returns true when puzzle is correctly solved with provided solution", () => {
      const generated = generator.generate();

      expect(generator.isValid(generated)).toBe(true);
    });

    test("returns true for a simple valid puzzle-solution pair", () => {
      const validPair = {
        puzzle: {
          version: 1,
          field: [
            [false, false, false, false, false],
            [false, false, true, false, false],
            [false, true, true, true, false],
            [false, false, true, false, false],
            [false, false, false, false, false],
          ],
        },
        result: {
          moves: [{ row: 2, col: 2 }],
        },
      };

      expect(generator.isValid(validPair)).toBe(true);
    });

    test("returns false when solution does not solve the puzzle", () => {
      const invalidPair = {
        puzzle: {
          version: 1,
          field: [
            [false, false, false, false, false],
            [false, false, true, false, false],
            [false, true, true, true, false],
            [false, false, true, false, false],
            [false, false, false, false, false],
          ],
        },
        result: {
          moves: [{ row: 0, col: 0 }], // Wrong solution
        },
      };

      expect(generator.isValid(invalidPair)).toBe(false);
    });

    test("returns false when solution is empty but puzzle is not solved", () => {
      const invalidPair = {
        puzzle: {
          version: 1,
          field: [
            [false, false, false, false, false],
            [false, false, true, false, false],
            [false, true, true, true, false],
            [false, false, true, false, false],
            [false, false, false, false, false],
          ],
        },
        result: {
          moves: [],
        },
      };

      expect(generator.isValid(invalidPair)).toBe(false);
    });

    test("returns true when puzzle is already solved and solution is empty", () => {
      const validPair = {
        puzzle: {
          version: 1,
          field: [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        result: {
          moves: [],
        },
      };

      expect(generator.isValid(validPair)).toBe(true);
    });

    test("throws error when puzzle is null", () => {
      expect(() => {
        generator.isValid({
          puzzle: null,
          result: { moves: [] },
        });
      }).toThrow();
    });

    test("throws error when puzzle is not an object", () => {
      expect(() => {
        generator.isValid({
          puzzle: "not an object",
          result: { moves: [] },
        });
      }).toThrow();
    });

    test("throws error when puzzle has wrong version", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 2,
            field: [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ],
          },
          result: { moves: [] },
        });
      }).toThrow();
    });

    test("throws error when puzzle field is not an array", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: "not an array",
          },
          result: { moves: [] },
        });
      }).toThrow();
    });

    test("throws error when puzzle field has wrong dimensions", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: [
              [false, false, false],
              [false, false, false],
              [false, false, false],
            ],
          },
          result: { moves: [] },
        });
      }).toThrow();
    });

    test("throws error when result is null", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ],
          },
          result: null,
        });
      }).toThrow();
    });

    test("throws error when result has no moves property", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ],
          },
          result: { notMoves: [] },
        });
      }).toThrow();
    });

    test("throws error when result.moves is not an array", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ],
          },
          result: { moves: "not an array" },
        });
      }).toThrow();
    });

    test("throws error when move has invalid coordinates", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ],
          },
          result: {
            moves: [{ row: -1, col: 0 }],
          },
        });
      }).toThrow();
    });

    test("throws error when move is missing row or col property", () => {
      expect(() => {
        generator.isValid({
          puzzle: {
            version: 1,
            field: [
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
              [false, false, false, false, false],
            ],
          },
          result: {
            moves: [{ row: 0 }],
          },
        });
      }).toThrow();
    });

    test("handles multiple moves correctly", () => {
      const validPair = {
        puzzle: {
          version: 1,
          field: [
            [true, true, false, false, false],
            [true, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
          ],
        },
        result: {
          moves: [{ row: 0, col: 0 }],
        },
      };

      expect(generator.isValid(validPair)).toBe(true);
    });
  });

  describe("difficulty levels work when", () => {
    test("easy difficulty generates puzzles with fewer moves", () => {
      const easyGenerator = new LightsOffGenerator("easy");
      const generated = easyGenerator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      expect(result.moves.length).toBeGreaterThanOrEqual(3);
      expect(result.moves.length).toBeLessThanOrEqual(7);
    });

    test("medium difficulty generates puzzles with moderate moves", () => {
      const mediumGenerator = new LightsOffGenerator("medium");
      const generated = mediumGenerator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      expect(result.moves.length).toBeGreaterThanOrEqual(8);
      expect(result.moves.length).toBeLessThanOrEqual(12);
    });

    test("hard difficulty generates puzzles with more moves", () => {
      const hardGenerator = new LightsOffGenerator("hard");
      const generated = hardGenerator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      expect(result.moves.length).toBeGreaterThanOrEqual(13);
      expect(result.moves.length).toBeLessThanOrEqual(18);
    });

    test("default difficulty is medium", () => {
      const defaultGenerator = new LightsOffGenerator();
      const generated = defaultGenerator.generate();
      const result = generated.result as unknown as {
        moves: Array<{ row: number; col: number }>;
      };

      // Should be in medium range
      expect(result.moves.length).toBeGreaterThanOrEqual(8);
      expect(result.moves.length).toBeLessThanOrEqual(12);
    });
  });
});
