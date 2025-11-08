import { describe, test } from "@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  fromUnknown,
  generateEmpty,
  isSolved,
  LightsOffField,
  toggle,
} from "./field.ts";

const empty: LightsOffField = {
  version: 1,
  field: [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ],
};

describe("Field is working when", () => {
  describe("generateEmpty is working when", () => {
    test("an empty field is generated", () => {
      const actual = generateEmpty();

      expect(actual).toStrictEqual(empty);
    });
  });

  describe("isSolved is working when", () => {
    test("all fields are false and true is returned", () => {
      expect(isSolved(empty)).toBe(true);
    });

    test("at least one field is true false is returned", () => {
      const field: LightsOffField = {
        version: 1,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, true, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
      };

      expect(isSolved(field)).toBe(false);
    });
  });

  describe("toggle() works when", () => {
    test("an on field is turned to off", () => {
      const field: LightsOffField = {
        version: 1,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, true, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
      };

      const changedField = toggle(field, 2, 2);

      expect(changedField.field[2][2]).toBe(false);
    });

    test("an off field is turned to on", () => {
      const field: LightsOffField = {
        version: 1,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
      };

      const changedField = toggle(field, 2, 2);

      expect(changedField.field[2][2]).toBe(true);
    });

    test("toggles adjacent cells (up, down, left, right)", () => {
      const changedField = toggle(empty, 2, 2);

      // Center cell toggles
      expect(changedField.field[2][2]).toBe(true);
      // Adjacent cells toggle (up, down, left, right)
      expect(changedField.field[1][2]).toBe(true); // up
      expect(changedField.field[3][2]).toBe(true); // down
      expect(changedField.field[2][1]).toBe(true); // left
      expect(changedField.field[2][3]).toBe(true); // right
      // Diagonal cells do NOT toggle
      expect(changedField.field[1][1]).toBe(false);
      expect(changedField.field[1][3]).toBe(false);
      expect(changedField.field[3][1]).toBe(false);
      expect(changedField.field[3][3]).toBe(false);
    });

    test("toggles corner cell and its 2 neighbors", () => {
      const changedField = toggle(empty, 0, 0);

      // Corner cell toggles
      expect(changedField.field[0][0]).toBe(true);
      // Only 2 neighbors toggle
      expect(changedField.field[0][1]).toBe(true); // right
      expect(changedField.field[1][0]).toBe(true); // down
      // Other cells remain unchanged
      expect(changedField.field[1][1]).toBe(false);
    });

    test("toggles edge cell and its 3 neighbors", () => {
      const changedField = toggle(empty, 0, 2);

      // Edge cell toggles
      expect(changedField.field[0][2]).toBe(true);
      // 3 neighbors toggle
      expect(changedField.field[0][1]).toBe(true); // left
      expect(changedField.field[0][3]).toBe(true); // right
      expect(changedField.field[1][2]).toBe(true); // down
      // Other cells remain unchanged
      expect(changedField.field[1][1]).toBe(false);
      expect(changedField.field[1][3]).toBe(false);
    });

    test("toggles bottom-right corner and its 2 neighbors", () => {
      const changedField = toggle(empty, 4, 4);

      // Corner cell toggles
      expect(changedField.field[4][4]).toBe(true);
      // Only 2 neighbors toggle
      expect(changedField.field[4][3]).toBe(true); // left
      expect(changedField.field[3][4]).toBe(true); // up
      // Other cells remain unchanged
      expect(changedField.field[3][3]).toBe(false);
    });

    test("handles multiple toggles correctly", () => {
      let field = toggle(empty, 2, 2); // Turn center on
      field = toggle(field, 2, 2); // Turn center off again

      // After toggling twice, adjacent cells are back to off
      // but cells that were toggled twice (center + neighbors)
      // should have different states
      expect(field.field[2][2]).toBe(false); // back to off
    });

    test("does not modify the original field (immutability)", () => {
      const original: LightsOffField = {
        version: 1,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
      };

      const changedField = toggle(original, 2, 2);

      // Original should remain unchanged
      expect(original.field[2][2]).toBe(false);
      expect(original.field[1][2]).toBe(false);
      // Changed field should have toggles
      expect(changedField.field[2][2]).toBe(true);
    });

    test("does nothing when point is out of bounds", () => {
      let actual = toggle(empty, -1, 0);
      actual = toggle(actual, 0, -1);
      actual = toggle(actual, 5, 0);
      actual = toggle(actual, 0, 5);

      expect(actual).toStrictEqual(empty);
    });
  });

  describe("fromUnknown works when", () => {
    test("a valid field is passed and a LightsOffField is returned", () => {
      expect(fromUnknown(empty)).toStrictEqual(empty);
    });

    test("an error is thrown when the field is not valid", () => {
      const notValidField: LightsOffField = {
        version: 1,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false], // <-- is too short!
        ],
      };

      expect(() => {
        fromUnknown(notValidField);
      }).toThrow();
    });

    test("an error is thrown when something else than a field is passed", () => {
      const notValidField = 10;

      expect(() => {
        fromUnknown(notValidField);
      }).toThrow();
    });

    test("an error is thrown when version is wrong", () => {
      const invalidVersion = {
        version: 2,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
      };

      expect(() => {
        fromUnknown(invalidVersion);
      }).toThrow();
    });

    test("an error is thrown when field is not an array", () => {
      const notArray = {
        version: 1,
        field: "not an array",
      };

      expect(() => {
        fromUnknown(notArray);
      }).toThrow();
    });

    test("an error is thrown when field has wrong dimensions", () => {
      const wrongDimensions = {
        version: 1,
        field: [
          [false, false, false],
          [false, false, false],
          [false, false, false],
        ],
      };

      expect(() => {
        fromUnknown(wrongDimensions);
      }).toThrow();
    });

    test("an error is thrown when field contains non-boolean values", () => {
      const nonBoolean = {
        version: 1,
        field: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, "invalid", false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
      };

      expect(() => {
        fromUnknown(nonBoolean);
      }).toThrow();
    });
  });
});
