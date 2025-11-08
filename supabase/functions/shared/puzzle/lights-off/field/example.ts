import {
  generateEmpty,
  isSolved,
  toggle,
  fromUnknown,
  LightsOffField,
} from "./field.ts";

/**
 * Example usage of the Lights Off field implementation
 */

console.log("=== Lights Off Field Examples ===\n");

// Example 1: Generate an empty field
console.log("1. Generate empty field:");
const emptyField = generateEmpty();
console.log("All lights off:", isSolved(emptyField)); // true
console.log();

// Example 2: Toggle the center light
console.log("2. Toggle center light (2,2):");
const centerToggled = toggle(emptyField, 2, 2);
console.log("Field after toggle:");
printField(centerToggled);
console.log("Is solved?", isSolved(centerToggled)); // false
console.log();

// Example 3: Toggle a corner
console.log("3. Toggle top-left corner (0,0):");
const cornerToggled = toggle(emptyField, 0, 0);
console.log("Field after toggle:");
printField(cornerToggled);
console.log("Only 3 lights toggled (corner + 2 neighbors)");
console.log();

// Example 4: Multiple toggles
console.log("4. Multiple toggles to create a pattern:");
let field = generateEmpty();
field = toggle(field, 2, 2); // Center
field = toggle(field, 0, 0); // Top-left
field = toggle(field, 4, 4); // Bottom-right
console.log("Field after 3 toggles:");
printField(field);
console.log();

// Example 5: Solve by toggling twice
console.log("5. Toggle center twice (returns to original):");
let twiceToggled = toggle(emptyField, 2, 2);
twiceToggled = toggle(twiceToggled, 2, 2);
console.log("Is solved?", isSolved(twiceToggled)); // true
console.log();

// Example 6: Validation
console.log("6. Validate input with fromUnknown:");
try {
  const _validField = fromUnknown(emptyField);
  console.log("✓ Valid field accepted");
} catch (error) {
  console.log("✗ Validation failed:", error);
}

try {
  const invalidField = { version: 2, field: [] };
  fromUnknown(invalidField);
} catch (error) {
  console.log("✓ Invalid field rejected:", (error as Error).message);
}
console.log();

// Example 7: Immutability demonstration
console.log("7. Immutability test:");
const original = generateEmpty();
const modified = toggle(original, 2, 2);
console.log("Original still empty?", isSolved(original)); // true
console.log("Modified has lights on?", !isSolved(modified)); // true
console.log();

// Example 8: Out of bounds
console.log("8. Out of bounds handling:");
const outOfBounds = toggle(emptyField, -1, 0);
console.log("Still solved after invalid toggle?", isSolved(outOfBounds)); // true
console.log();

/**
 * Helper function to print the field in a readable format
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

/**
 * Practical example: Creating a solvable puzzle
 */
console.log("9. Creating a solvable puzzle (reverse engineering):");
console.log("Start with empty field, apply random moves:");
let puzzle = generateEmpty();
const moves = [
  { row: 1, col: 1 },
  { row: 2, col: 3 },
  { row: 3, col: 2 },
];

console.log("\nApplying moves:", JSON.stringify(moves));
for (const move of moves) {
  puzzle = toggle(puzzle, move.row, move.col);
}

console.log("\nResulting puzzle:");
printField(puzzle);
console.log("\nThis puzzle is guaranteed solvable!");
console.log("Solution: Apply the same moves in any order");
console.log();

/**
 * Advanced example: Detecting patterns
 */
console.log("10. Pattern detection:");
let crossPattern = generateEmpty();
crossPattern = toggle(crossPattern, 2, 2); // Center
console.log("Cross pattern (center + 4 neighbors):");
printField(crossPattern);
console.log();
