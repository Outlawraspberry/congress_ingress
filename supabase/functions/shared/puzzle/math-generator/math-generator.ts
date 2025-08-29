import { Json } from "../../../../../types/database.types.ts";
import { PuzzleGenerator } from "../puzzle-generator.ts";

export class MathGenerator implements PuzzleGenerator {
  private static validOperators = ["+", "*", "-", "/"];

  generate(): { result: Json; puzzle: Json } {
    const leftHandle = this.randomNumber();
    const rightHandle = this.randomNumber();
    const operator = "+";

    const result = this.calculate(leftHandle, rightHandle, operator);

    return {
      puzzle: {
        leftHandle,
        rightHandle,
        operator,
      },
      result,
    };
  }

  isValid({ result, puzzle }: { result: Json; puzzle: Json }): boolean {
    if (puzzle == null || typeof puzzle !== "object") {
      throw new Error("Puzzle input is null or isn't an object!");
    }

    if (!("leftHandle" in puzzle && typeof puzzle.leftHandle === "number")) {
      throw new Error("leftHandle is not in puzzle or is not a number");
    }

    if (!("rightHandle" in puzzle && typeof puzzle.rightHandle === "number")) {
      throw new Error("rightHandle is not in puzzle or is not a number");
    }

    if (
      !(
        "operator" in puzzle &&
        typeof puzzle.operator === "string" &&
        MathGenerator.validOperators.includes(puzzle.operator)
      )
    ) {
      throw new Error(
        `operator is not in puzzle or is not a string or not one of "${
          MathGenerator.validOperators.join(", ")
        }"`,
      );
    }

    const calculatedResult = this.calculate(
      puzzle.leftHandle,
      puzzle.rightHandle,
      puzzle.operator,
    );

    return calculatedResult === result;
  }

  private calculate(leftHandle: number, rightHandle: number, operator: string) {
    if (!MathGenerator.validOperators.includes(operator)) {
      throw new Error("Invalid operator");
    }

    if (operator === "+") {
      return leftHandle + rightHandle;
    } else if (operator === "*") {
      return leftHandle * rightHandle;
    } else if (operator === "-") {
      return leftHandle - rightHandle;
    } else {
      return leftHandle / rightHandle;
    }
  }

  private randomNumber(): number {
    return Math.floor(Math.random() * 10);
  }
}
