import { describe, test } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { isActionValid } from "./action.ts";

describe("action works when", () => {
  test("a valid action is validated as valid", () => {
    const input = {
      point: "10f9efca-1424-4ab5-92ae-12c3b0be7b6f",
      type: "attack",
    };

    expect(isActionValid(input)).toBe(true);
  });

  test("a invalid action is validated as invalid", () => {
    const input = {
      point: "10f9efca-1424-4ab5-92ae-1c3b0be7b6f", // Invalid UUID
      type: "attack",
    };

    expect(() => {
      isActionValid(input);
    }).toThrow();
  });


});
