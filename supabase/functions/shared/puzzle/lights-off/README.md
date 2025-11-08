# Lights Off Puzzle Game

## Overview

**Lights Off** (also known as **Lights Out**) is a classic logic puzzle game originally released by Tiger Electronics in 1995. The GNOME games suite includes a version called "Lightsoff". The objective is to turn off all the lights on the board through strategic button presses.

## Game Structure

### Board Layout
- The game is played on a **5×5 grid** of lights (25 total lights)
- Each light can be in one of two states: **ON** (lit) or **OFF** (dark)
- The game starts with a random pattern of lights that are turned on

### Visual Representation
```
Initial state example:
■ □ ■ □ ■
□ ■ ■ ■ □
■ ■ □ ■ ■
□ ■ ■ ■ □
■ □ ■ □ ■

Where:
■ = Light ON (lit)
□ = Light OFF (dark)
```

## Game Mechanics

### Toggle Behavior
When a player clicks/presses any light on the board:
1. **The clicked light toggles** (ON → OFF or OFF → ON)
2. **The four orthogonally adjacent lights toggle** (up, down, left, right)
3. **Diagonal neighbors are NOT affected**

### Example Toggle
```
Before pressing center light (2,2):
□ □ □ □ □
□ □ ■ □ □      The center ■ and its 4 neighbors
□ ■ ■ ■ □      will toggle
□ □ ■ □ □
□ □ □ □ □

After pressing center light (2,2):
□ □ □ □ □
□ □ □ □ □      All affected lights have switched
□ □ □ □ □      from their previous state
□ □ □ □ □
□ □ □ □ □
```

### Edge and Corner Behavior
- Lights on the **edges** have only 3 neighbors
- Lights in the **corners** have only 2 neighbors
- There are no wrap-around effects

```
Corner press (top-left):
■ ■ □ □ □      Press (0,0)      □ □ □ □ □
■ □ □ □ □   ────────────→      □ ■ □ □ □
□ □ □ □ □                      □ □ □ □ □
□ □ □ □ □                      □ □ □ □ □
□ □ □ □ □                      □ □ □ □ □

Only the pressed light and 2 neighbors toggle
```

## Objective

**Win Condition**: Turn off ALL lights on the board (achieve an all-dark 5×5 grid)

**Goal**: Solve the puzzle with the minimum number of button presses

## Mathematical Properties

### Key Insights

1. **Order Independence**: The order in which lights are pressed does not matter. Pressing light A then B produces the same result as pressing B then A.

2. **Press Once Maximum**: In an optimal solution, each light should be pressed **at most once**. Pressing a light twice cancels out the effect, so it's equivalent to not pressing it at all.

3. **Solvability**: Not all random configurations are solvable! According to mathematical analysis by Anderson and Feil (1998), only certain patterns have solutions.

4. **Multiple Solutions**: For solvable configurations, there are exactly **4 distinct solutions** (excluding redundant moves). These solutions are related by two specific null patterns (N₁ and N₂).

### Null Patterns

Two special 5×5 patterns that, when pressed, return the board to its original state:

**N₁ (X-pattern):**
```
□ ■ ■ ■ □
■ □ ■ □ ■
■ ■ □ ■ ■
■ □ ■ □ ■
□ ■ ■ ■ □
```

**N₂ (Columns pattern):**
```
■ □ ■ □ ■
■ □ ■ □ ■
□ □ □ □ □
■ □ ■ □ ■
■ □ ■ □ ■
```

If X is a solution, then X + N₁, X + N₂, and X + N₁ + N₂ are also solutions.

## Solution Strategies

### 1. Light Chasing Method

The most common solving strategy, similar to Gaussian elimination:

**Algorithm:**
1. Start with the **top row**
2. For each lit light in the current row, press the button **directly below it** in the next row
3. This will turn off the light in the current row
4. Move to the next row and repeat steps 2-3
5. Continue until you reach the **bottom row**
6. The bottom row pattern determines which lights to press in the **top row** (use lookup table below)
7. Run the algorithm again from step 1

**Bottom Row Lookup Table:**

When you reach the bottom row with the following pattern, press these lights in the top row:

| Bottom Row Pattern | Top Row to Press |
|-------------------|------------------|
| □□□■■ | ■□■■■ |
| □□■□□ | ■■□■■ |
| □■□□■ | ■■■■□ |
| □■■■□ | □□■■■ |
| ■□□■□ | □■■■■ |
| ■□■□■ | □■■□■ |
| ■■□□□ | ■■■□■ |

### 2. Pattern Recognition

Experienced players memorize common patterns and their solutions:
- Symmetric patterns often have symmetric solutions
- Corner and edge patterns have predictable solutions
- Single-light problems have straightforward solutions

## Implementation Considerations

### Data Structure

The game state can be represented as:
- A **5×5 boolean array** where `true` = light ON, `false` = light OFF
- Or a **25-bit integer** for compact storage
- Or a **25-element array** in row-major order

### State Representation Example
```typescript
// 2D Array (recommended for clarity)
field: boolean[][] = [
  [true, false, true, false, true],   // Row 0
  [false, true, true, true, false],   // Row 1
  [true, true, false, true, true],    // Row 2
  [false, true, true, true, false],   // Row 3
  [true, false, true, false, true]    // Row 4
];
```

### Core Operations Needed

1. **Toggle Light**: Apply toggle to a position and its neighbors
2. **Check Win**: Verify all lights are OFF
3. **Generate Puzzle**: Create a solvable starting configuration
4. **Validate Solution**: Check if a sequence of moves solves the puzzle

### Generating Solvable Puzzles

**Method 1 - Reverse Engineering (Recommended):**
- Start with all lights OFF
- Apply a random sequence of button presses
- The resulting pattern is guaranteed to be solvable
- The reverse sequence is a valid solution

**Method 2 - Random with Validation:**
- Generate random pattern
- Use linear algebra to check if solvable
- Reject and regenerate if not solvable

### Puzzle Generation Parameters

- **Difficulty by moves**: Easy (5-10 moves), Medium (11-15 moves), Hard (16-20 moves)
- **Pattern complexity**: More scattered lights = harder puzzles
- **Solution uniqueness**: Track the minimum number of moves required

## Game Variations

While the classic game uses 5×5:
- **3×3**: Simpler, always solvable
- **4×4**: Moderate difficulty
- **6×6 and larger**: Increased complexity
- **Hexagonal grids**: Alternative topology
- **Multi-color**: More than 2 states per light

## API Design

### Field Structure
```typescript
interface LightsOffField {
  field: boolean[][];  // 5x5 grid, true = ON, false = OFF
  version: number;     // Schema version for future compatibility
}
```

### Puzzle Structure
```typescript
interface LightsOffPuzzle {
  initialState: boolean[][];
  difficulty?: 'easy' | 'medium' | 'hard';
  minMoves?: number;  // Minimum moves to solve
}
```

### Solution Structure
```typescript
interface LightsOffSolution {
  moves: Array<{row: number, col: number}>;
  totalMoves: number;
}
```

## References

- Original game by Tiger Electronics (1995)
- GNOME Lightsoff: https://wiki.gnome.org/Apps/Lightsoff
- Mathematical analysis: Anderson, M. & Feil, T. (1998). "Turning Lights Out with Linear Algebra"
- Wikipedia: https://en.wikipedia.org/wiki/Lights_Out_(game)

## Next Steps for Implementation

1. ✅ Document game mechanics (this file)
2. ⬜ Implement field toggle logic
3. ⬜ Implement puzzle generator (solvable configurations)
4. ⬜ Implement solution validator
5. ⬜ Add tests for all edge cases
6. ⬜ Implement solver algorithm
7. ⬜ Add difficulty levels