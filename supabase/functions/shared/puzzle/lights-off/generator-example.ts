import { LightsOffGenerator } from "./lights-off-generator.ts";
import { LightsOffField, toggle, isSolved } from "./field/field.ts";

/**
 * Example usage of the Lights Off Generator
 */

console.log("=== Lights Off Generator Examples ===\n");

// Example 1: Generate a medium difficulty puzzle
console.log("1. Generate a medium difficulty puzzle (default):");
const generator = new LightsOffGenerator();
const puzzle1 = generator.generate();

console.log("Puzzle generated:");
printField(puzzle1.puzzle as unknown as LightsOffField);
console.log(
  "\nSolution moves:",
  (puzzle1.result as unknown as { moves: Array<{ row: number; col: number }> })
    .moves,
);
console.log("Is valid solution?", generator.isValid(puzzle1));
console.log();

// Example 2: Generate an easy puzzle
console.log("2. Generate an easy puzzle:");
const easyGenerator = new LightsOffGenerator("easy");
const easyPuzzle = easyGenerator.generate();

const easyResult = easyPuzzle.result as unknown as {
  moves: Array<{ row: number; col: number }>;
};
console.log("Puzzle:");
printField(easyPuzzle.puzzle as unknown as LightsOffField);
console.log(`\nNumber of moves in solution: ${easyResult.moves.length}`);
console.log("Solution:", easyResult.moves);
console.log();

// Example 3: Generate a hard puzzle
console.log("3. Generate a hard puzzle:");
const hardGenerator = new LightsOffGenerator("hard");
const hardPuzzle = hardGenerator.generate();

const hardResult = hardPuzzle.result as unknown as {
  moves: Array<{ row: number; col: number }>;
};
console.log("Puzzle:");
printField(hardPuzzle.puzzle as unknown as LightsOffField);
console.log(`\nNumber of moves in solution: ${hardResult.moves.length}`);
console.log("(Solution is longer, making it harder)");
console.log();

// Example 4: Validate a correct solution
console.log("4. Validate a correct solution:");
const testPuzzle = generator.generate();
console.log("Generated puzzle is valid:", generator.isValid(testPuzzle));
console.log();

// Example 5: Validate an incorrect solution
console.log("5. Validate an incorrect solution:");
const invalidSolution = {
  puzzle: testPuzzle.puzzle,
  result: { moves: [{ row: 0, col: 0 }] }, // Wrong solution
};
console.log(
  "Invalid solution is rejected:",
  !generator.isValid(invalidSolution),
);
console.log();

// Example 6: Manually solve a generated puzzle
console.log("6. Manually solve a generated puzzle:");
const puzzleToSolve = generator.generate();
const puzzleField = puzzleToSolve.puzzle as unknown as LightsOffField;
const solution = puzzleToSolve.result as unknown as {
  moves: Array<{ row: number; col: number }>;
};

console.log("Initial puzzle:");
printField(puzzleField);
console.log(`\nApplying ${solution.moves.length} moves...`);

let currentState = puzzleField;
for (let i = 0; i < solution.moves.length; i++) {
  const move = solution.moves[i];
  currentState = toggle(currentState, move.row, move.col);
  console.log(`\nAfter move ${i + 1} (row: ${move.row}, col: ${move.col}):`);
  printField(currentState);
}

console.log("\nIs solved?", isSolved(currentState));
console.log();

// Example 7: Generate multiple puzzles of different difficulties
console.log("7. Generate multiple puzzles and compare:");
const difficulties: Array<"easy" | "medium" | "hard"> = [
  "easy",
  "medium",
  "hard",
];

for (const difficulty of difficulties) {
  const gen = new LightsOffGenerator(difficulty);
  const puzzle = gen.generate();
  const result = puzzle.result as unknown as {
    moves: Array<{ row: number; col: number }>;
  };
  console.log(
    `${difficulty.toUpperCase()}: ${result.moves.length} moves required`,
  );
}
console.log();

// Example 8: Statistics over multiple generations
console.log("8. Generate 10 medium puzzles and show statistics:");
const movesCounts: number[] = [];
for (let i = 0; i < 10; i++) {
  const puzzle = generator.generate();
  const result = puzzle.result as unknown as {
    moves: Array<{ row: number; col: number }>;
  };
  movesCounts.push(result.moves.length);
}

const avg = movesCounts.reduce((a, b) => a + b, 0) / movesCounts.length;
const min = Math.min(...movesCounts);
const max = Math.max(...movesCounts);

console.log(`Move counts: ${movesCounts.join(", ")}`);
console.log(`Average: ${avg.toFixed(1)} moves`);
console.log(`Range: ${min}-${max} moves`);
console.log();

// Example 9: Error handling
console.log("9. Error handling examples:");
try {
  generator.isValid({
    puzzle: null,
    result: { moves: [] },
  });
  console.log("ERROR: Should have thrown!");
} catch (error) {
  console.log("✓ Correctly rejected null puzzle:", (error as Error).message);
}

try {
  generator.isValid({
    puzzle: { version: 1, field: [[]] }, // Wrong dimensions
    result: { moves: [] },
  });
  console.log("ERROR: Should have thrown!");
} catch (error) {
  console.log(
    "✓ Correctly rejected invalid field:",
    (error as Error).message,
  );
}

try {
  generator.isValid({
    puzzle: puzzleField,
    result: { moves: [{ row: -1, col: 0 }] }, // Invalid coordinates
  });
  console.log("ERROR: Should have thrown!");
} catch (error) {
  console.log(
    "✓ Correctly rejected invalid move:",
    (error as Error).message,
  );
}
console.log();

// Example 10: Show that move order doesn't matter (mathematically)
console.log("10. Demonstrate that move order doesn't matter:");
const orderPuzzle = generator.generate();
const orderSolution = orderPuzzle.result as unknown as {
  moves: Array<{ row: number; col: number }>;
};

// Apply moves in original order
let state1 = orderPuzzle.puzzle as unknown as LightsOffField;
for (const move of orderSolution.moves) {
  state1 = toggle(state1, move.row, move.col);
}

// Apply moves in reverse order
let state2 = orderPuzzle.puzzle as unknown as LightsOffField;
for (let i = orderSolution.moves.length - 1; i >= 0; i--) {
  const move = orderSolution.moves[i];
  state2 = toggle(state2, move.row, move.col);
}

console.log("Original order solved:", isSolved(state1));
console.log("Reverse order solved:", isSolved(state2));
console.log("Both states are identical:", JSON.stringify(state1) === JSON.stringify(state2));
console.log("(This is because toggle operations are commutative)");
console.log();

/**
 * Helper function to print a field
 */
function printField(field: LightsOffField) {
  for (let row = 0; row < 5; row++) {
    let line = "";
    for (let col = 0; col < 5; col++) {
      line += field.field[row][col] ? "■ " : "□ ";
    }
    console.log(line);
  }
}

console.log("=== All examples completed! ===");
