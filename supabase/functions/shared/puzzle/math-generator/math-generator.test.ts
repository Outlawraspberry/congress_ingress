import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { MathGenerator } from "./math-generator.ts";

describe("MathGenerator works when", () => {
  const generator = new MathGenerator();

  test("validate returns true, when the puzzle was solved correct", () => {
    expect(
      generator.isValid({
        result: 10,
        puzzle: {
          leftHandle: 5,
          rightHandle: 5,
          operator: "+",
        },
      }),
    ).toBe(true);
  });

  test("validate returns false, when the puzzle was not solved correct", () => {
    expect(
      generator.isValid({
        result: 10,
        puzzle: {
          leftHandle: 5,
          rightHandle: 5,
          operator: "-",
        },
      }),
    ).toBe(false);
  });

  test("validate throws an error, if there is an error in the input format", () => {
    expect(() => {
      generator.isValid({
        result: 10,
        puzzle: {
          leftHandle: "5",
          rightHandle: 5,
          operator: "+",
        },
      });
    }).toThrow();
  });

  test("generate generates a puzzle result combination, which is valid", () => {
    expect(generator.isValid(generator.generate())).toBe(true);
  });
});
