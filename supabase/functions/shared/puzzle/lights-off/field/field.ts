const fieldSize = 5;

export interface LightsOffField {
  field: boolean[][];
  version: 1;
}

export function generateEmpty(): LightsOffField {
  throw new Error("Not implemented");
}

export function isSolved(field: LightsOffField): boolean {
  throw new Error("Not implemented");
}

export function toggle(
  field: LightsOffField,
  x: number,
  y: number,
): LightsOffField {
  throw new Error("Not implemented");
}

export function fromUnknown(input: unknown): LightsOffField {
  throw new Error("Not implemented");
}
