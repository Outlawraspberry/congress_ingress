const fieldSize = 5;

export interface LightsOffField {
  field: boolean[][];
  version: 1;
}

/**
 * Generates an empty 5x5 field with all lights off
 */
export function generateEmpty(): LightsOffField {
  const field: boolean[][] = [];

  for (let row = 0; row < fieldSize; row++) {
    field[row] = [];
    for (let col = 0; col < fieldSize; col++) {
      field[row][col] = false;
    }
  }

  return {
    version: 1,
    field,
  };
}

/**
 * Checks if the puzzle is solved (all lights are off)
 */
export function isSolved(field: LightsOffField): boolean {
  for (let row = 0; row < fieldSize; row++) {
    for (let col = 0; col < fieldSize; col++) {
      if (field.field[row][col]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Toggles a light at position (row, col) and its orthogonal neighbors
 * Returns a new field without modifying the original (immutable)
 *
 * @param field The current field state
 * @param row The row index (0-4)
 * @param col The column index (0-4)
 * @returns A new field with the toggle applied
 */
export function toggle(
  field: LightsOffField,
  row: number,
  col: number,
): LightsOffField {
  // Check bounds - if out of bounds, return unchanged field
  if (row < 0 || row >= fieldSize || col < 0 || col >= fieldSize) {
    return field;
  }

  // Create a deep copy of the field to maintain immutability
  const newField: boolean[][] = field.field.map((row) => [...row]);

  // Toggle the clicked cell
  newField[row][col] = !newField[row][col];

  // Toggle adjacent cells (up, down, left, right - NOT diagonals)
  const adjacentPositions = [
    { row: row - 1, col }, // up
    { row: row + 1, col }, // down
    { row, col: col - 1 }, // left
    { row, col: col + 1 }, // right
  ];

  for (const pos of adjacentPositions) {
    // Only toggle if the position is within bounds
    if (
      pos.row >= 0 &&
      pos.row < fieldSize &&
      pos.col >= 0 &&
      pos.col < fieldSize
    ) {
      newField[pos.row][pos.col] = !newField[pos.row][pos.col];
    }
  }

  return {
    version: 1,
    field: newField,
  };
}

/**
 * Validates and converts unknown input to LightsOffField
 * Throws an error if the input is invalid
 *
 * @param input Unknown input to validate
 * @returns A valid LightsOffField
 * @throws Error if validation fails
 */
export function fromUnknown(input: unknown): LightsOffField {
  // Check if input is an object
  if (typeof input !== "object" || input === null) {
    throw new Error("Input must be an object");
  }

  const obj = input as Record<string, unknown>;

  // Check version
  if (obj.version !== 1) {
    throw new Error("Invalid version: must be 1");
  }

  // Check if field exists and is an array
  if (!Array.isArray(obj.field)) {
    throw new Error("Field must be an array");
  }

  // Check field dimensions
  if (obj.field.length !== fieldSize) {
    throw new Error(`Field must have ${fieldSize} rows`);
  }

  // Validate each row
  for (let row = 0; row < fieldSize; row++) {
    if (!Array.isArray(obj.field[row])) {
      throw new Error(`Row ${row} must be an array`);
    }

    if (obj.field[row].length !== fieldSize) {
      throw new Error(`Row ${row} must have ${fieldSize} columns`);
    }

    // Validate each cell is a boolean
    for (let col = 0; col < fieldSize; col++) {
      if (typeof obj.field[row][col] !== "boolean") {
        throw new Error(`Cell [${row}][${col}] must be a boolean`);
      }
    }
  }

  // If all validations pass, return as LightsOffField
  return input as LightsOffField;
}
