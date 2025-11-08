# Congress Ingress - Mini Game Ideas

## Overview

This document outlines ideas for expanding the mini-game system in Congress Ingress. Mini-games are used at special points to allow players to earn Action Points (AP) through fun, quick puzzles.

## Current State

Currently, the game features a single mini-game type:
- **Basic Math** - Simple arithmetic with numbers 0-9 (addition only)
- Players solve equations like "5 + 3 = ?"
- Time-limited challenge
- Awards AP upon successful completion

## Design Principles for Mini-Games

All mini-games should follow these principles:
1. **Quick to play** - 30-90 seconds per puzzle
2. **Clear win condition** - Player knows exactly when they've succeeded
3. **Scalable difficulty** - Easy, Medium, Hard variations
4. **Self-contained** - No external knowledge required (except themed quizzes)
5. **Mobile-friendly** - Work well on touch screens
6. **Fair validation** - Can be verified server-side
7. **Fun and engaging** - Players should enjoy earning AP

---

## Game Ideas

### 1. Lights Out Puzzle 🔦
*The classic toggle puzzle - turn all the lights off!*

#### Concept
A grid of lights where clicking a light toggles itself and its adjacent neighbors (up, down, left, right). The goal is to turn all lights off.

#### Gameplay
- Grid of lights (3x3, 4x4, or 5x5) with random initial state
- Click a light to toggle it and its orthogonal neighbors
- Win when all lights are off
- Time-limited (60-180 seconds depending on difficulty)

#### Difficulty Levels
- **Easy:** 3x3 grid, simple patterns (3-5 optimal moves)
- **Medium:** 4x4 grid, moderate patterns (5-8 optimal moves)
- **Hard:** 5x5 grid, complex patterns (8-12 optimal moves)

#### Game State
```typescript
{
  grid: boolean[][], // 2D array of light states (true = on, false = off)
  size: number,      // Grid dimension (3, 4, or 5)
  moves: number      // Number of moves made by player
}
```

#### Validation
- Check if all cells in grid are `false`
- Verify move count is reasonable (not impossibly low)

#### Implementation Notes
- Must generate solvable puzzles (not all random configurations are solvable)
- Can use Gaussian elimination over GF(2) to ensure solvability
- Pre-compute solutions to verify difficulty rating
- Visual feedback: smooth toggle animations, satisfying "click" sound

#### Theme Integration
"Turn off the opposition!" - Each light represents a congressional district or political opponent.

#### Estimated AP Rewards
- Easy (3x3): 8 AP
- Medium (4x4): 12 AP
- Hard (5x5): 18 AP
- Time bonus: +2 AP for solving 20% faster than time limit

---

### 2. Pattern Memory (Simon Says) 🎵
*Watch, remember, and repeat the colored sequence*

#### Concept
The classic Simon Says memory game - watch a sequence of colored buttons flash, then repeat the pattern perfectly.

#### Gameplay
- 4 colored buttons (Red, Blue, Yellow, Green)
- Sequence starts with 1 color
- After player repeats correctly, sequence adds one more color
- Continue until player makes a mistake or reaches target length
- Each button has distinct sound and visual feedback

#### Difficulty Levels
- **Easy:** Repeat 4-5 colors correctly
- **Medium:** Repeat 6-8 colors correctly
- **Hard:** Repeat 9-12 colors correctly
- Speed increases slightly after each successful round

#### Game State
```typescript
{
  sequence: number[],        // Array of button indices (0-3)
  playerInput: number[],     // Player's current input
  currentRound: number,      // How many colors in current sequence
  isPlayingSequence: boolean // Is the computer showing the pattern?
}
```

#### Validation
- Compare player's full input sequence to generated sequence
- Verify sequence length matches difficulty requirement
- Check timestamps to prevent unrealistic response times

#### Implementation Notes
- Use Web Audio API for distinct button sounds
- Visual: Buttons light up with smooth animations
- Disable input while sequence is playing
- Show sequence with ~800ms between each flash
- Allow ~1.5x sequence time for player input

#### Theme Integration
Colors represent different political factions, committees, or states:
- Red: Republican faction
- Blue: Democratic faction
- Yellow: Independent/Swing districts
- Green: Legislative achievements

#### Estimated AP Rewards
- Easy (4-5 colors): 6 AP
- Medium (6-8 colors): 10 AP
- Hard (9-12 colors): 15 AP

---

### 3. Word Scramble (Congress Edition) 📝
*Unscramble political and governmental terms*

#### Concept
Unscramble letters to form government, political, or congressional terms within a time limit.

#### Gameplay
- Display scrambled letters of a word
- Player types to unscramble
- Real-time feedback (remaining time, letter count)
- Optional hint: Show word category or first letter
- Time limit scales with word length

#### Difficulty Levels & Word Examples

**Easy (4-6 letters, 30 seconds):**
- VOTE, BILL, LAW, VETO
- SENATE, HOUSE, COURT, STATE
- MAYOR, JUDGE, CHIEF

**Medium (7-10 letters, 45 seconds):**
- CONGRESS, ELECTION, CABINET
- DELEGATE, CHAIRMAN, GOVERNOR
- CAMPAIGN, DISTRICT, MAJORITY

**Hard (11+ letters, 60 seconds):**
- FILIBUSTER, AMENDMENT, LEGISLATURE
- RATIFICATION, GERRYMANDER, APPROPRIATION
- BICAMERAL, IMPEACHMENT, CONSTITUTION

#### Game State
```typescript
{
  originalWord: string,      // The correct answer

  scrambledWord: string,     // The scrambled version shown to player
  playerGuess: string,       // Current player input
  category: string,          // Word category (optional hint)
  difficulty: 'easy' | 'medium' | 'hard'
}
```

#### Validation
- Case-insensitive string comparison
- Strip whitespace from both sides
- Could allow minor typos (Levenshtein distance = 1) for hard words

#### Implementation Notes
- Maintain a word database with categories
- Scramble algorithm should ensure scrambled ≠ original
- Can add progressive hints (cost: -2 AP per hint)
- Visual: Highlight matching letters as player types

#### Word Database Structure
```sql
CREATE TABLE word_bank (
  id UUID PRIMARY KEY,
  word TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Theme Integration
Perfect thematic fit - educational about government terminology.

#### Estimated AP Rewards
- Easy: 5 AP
- Medium: 9 AP
- Hard: 14 AP
- Speed bonus: +3 AP if solved in under 50% of time limit

---

### 4. Rapid Fire Quiz ⚡
*Quick true/false questions about government and politics*

#### Concept
Answer a series of rapid-fire true/false questions correctly within individual time limits. Must achieve 80%+ accuracy to win.

#### Gameplay
- 5-10 true/false questions per round
- 5-10 seconds per question (varies by difficulty)
- Progress bar shows time remaining
- Must get 80% correct to win AP
- Visual feedback: Green checkmark or red X after each answer

#### Difficulty Levels

**Easy (10 questions, 10 seconds each):**
- "The U.S. Senate has 100 members" (TRUE)
- "The President can declare war" (FALSE - Congress does)
- "Supreme Court justices serve for life" (TRUE)

**Medium (8 questions, 7 seconds each):**
- "A filibuster can only occur in the Senate" (TRUE)
- "Congress can override a veto with 2/3 vote" (TRUE)
- "The House has more members than the Senate" (TRUE)

**Hard (5 questions, 5 seconds each):**
- "The Senate can ratify treaties with 2/3 vote" (TRUE)
- "Cabinet members must be confirmed by both chambers" (FALSE - Senate only)
- "The Vice President can vote in the House" (FALSE - Senate only)

#### Game State
```typescript
{
  questions: Array<{
    id: string,
    text: string,
    correctAnswer: boolean,
    answered?: boolean,
    userAnswer?: boolean
  }>,
  currentQuestionIndex: number,
  correctAnswers: number,
  totalQuestions: number,
  timePerQuestion: number
}
```

#### Validation
- Check percentage of correct answers ≥ 80%
- Verify timestamps to prevent cheating
- Ensure all questions were answered

#### Implementation Notes
- Question bank stored in database with categories
- Random selection from pool (no repeats in same session)
- Can track user's historical performance to adjust difficulty
- Add explanations after quiz completion (educational)

#### Question Database Structure
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  correct_answer BOOLEAN NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Theme Integration
Educational and perfectly themed - teaches players about government.

#### Estimated AP Rewards
- Easy (80% of 10): 7 AP
- Medium (80% of 8): 11 AP
- Hard (80% of 5): 16 AP
- Perfect score bonus: +4 AP for 100% correct

---

### 5. Tile Slider Puzzle 🧩
*Slide tiles to reveal congressional imagery*

#### Concept
Classic sliding tile puzzle where one tile is missing. Slide tiles into the empty space to reconstruct the correct image or number sequence.

#### Gameplay
- Grid with N²-1 tiles and one empty space
- Click adjacent tile to slide it into empty space
- Reconstruct target arrangement (image or numbered sequence)
- Limited by time or move count

#### Difficulty Levels
- **Easy:** 3x3 grid (8 tiles), 2 minutes OR 60 moves
- **Medium:** 4x4 grid (15 tiles), 4 minutes OR 120 moves
- **Hard:** 5x5 grid (24 tiles), 6 minutes OR 200 moves

#### Game State
```typescript
{
  grid: number[][],          // 2D array, 0 represents empty space
  targetGrid: number[][],    // The solved state
  emptyPosition: { row: number, col: number },
  moveCount: number,
  timeElapsed: number
}
```

#### Validation
- Check if current grid matches target grid
- Verify move count is achievable (not impossibly low)
- Check that configuration is reachable from start state

#### Implementation Notes
- **Critical:** Not all random configurations are solvable
  - Must check inversion parity to ensure solvability
  - Generate by making random valid moves from solved state
- Use images: Congressional seal, Capitol building, state flags
- Or use numbered tiles (1-8 for 3x3, 1-15 for 4x4, etc.)
- Visual: Smooth slide animations between positions
- Touch-friendly: Swipe gestures on mobile

#### Solvability Check
```typescript
// A configuration is solvable if:
// - For odd-width grids: inversion count is even
// - For even-width grids: (inversion count + empty row from bottom) is odd
```

#### Theme Integration
Images feature congressional/political symbols:
- Capitol building
- Congressional seal
- State flags
- Historical political figures
- "We the People" text from Constitution

#### Estimated AP Rewards
- Easy (3x3): 7 AP
- Medium (4x4): 13 AP
- Hard (5x5): 20 AP
- Move efficiency bonus: +5 AP if solved near optimal move count

---

### 6. Color Code Breaker (Mastermind) 🎯
*Use logic to crack the secret color code*

#### Concept
Guess a secret sequence of colors using logical deduction from feedback. Like the classic Mastermind board game.

#### Gameplay
- Secret code of 4-5 colored pegs (selected from 6-8 colors)
- Player makes a guess
- Feedback provided:
  - **Black peg:** Right color in right position
  - **White peg:** Right color in wrong position
  - *No peg:* Color not in code
- Limited attempts to guess the exact sequence
- Win by guessing correctly within attempt limit

#### Difficulty Levels
- **Easy:** 4 positions, 6 colors, 12 attempts, no duplicates
- **Medium:** 4 positions, 8 colors, 10 attempts, duplicates allowed
- **Hard:** 5 positions, 8 colors, 8 attempts, duplicates allowed

#### Game State
```typescript
{
  secretCode: number[],      // The code to guess (color indices)
  guesses: Array<{
    guess: number[],
    feedback: { blacks: number, whites: number }
  }>,
  attemptsRemaining: number,
  availableColors: string[], // Color names or hex codes
  allowDuplicates: boolean
}
```

#### Validation
- Verify secret code is never revealed to client
- Check guess count doesn't exceed limit
- Validate feedback calculation algorithm

#### Implementation Notes
- Colors represent political themes:
  - Red, Blue (major parties)
  - Yellow, Green, Purple, Orange (states/regions/independents)
- Feedback algorithm:
  1. Count exact matches (blacks)
  2. Remove exact matches from consideration
  3. Count color matches in wrong positions (whites)
- Visual: Draggable colored pegs or dropdown selectors
- Show all previous guesses with feedback for strategy

#### Theme Integration
"Break the political code" - Each color represents a faction, state, or political element.

#### Estimated AP Rewards
- Easy: 10 AP
- Medium: 15 AP
- Hard: 22 AP
- Efficiency bonus: +3 AP per attempt remaining when solved

---

### 7. Number Sequence Completion 🔢
*Identify the pattern and complete the sequence*

#### Concept
Identify the mathematical or logical pattern in a number sequence and provide the next number(s).

#### Gameplay
- Display a sequence of 4-6 numbers
- Player identifies the pattern
- Player enters the next 1-2 numbers
- Time limit: 30-60 seconds depending on difficulty

#### Difficulty Levels & Pattern Types

**Easy (45 seconds):**
- Arithmetic: 2, 4, 6, 8, ? → (10)
- Simple skip: 5, 10, 15, 20, ? → (25)
- Constant addition: 3, 7, 11, 15, ? → (19)

**Medium (40 seconds):**
- Geometric: 2, 4, 8, 16, ? → (32)
- Fibonacci: 1, 1, 2, 3, 5, ? → (8)
- Alternating: 2, 4, 3, 6, 4, ? → (8)

**Hard (30 seconds):**
- Prime numbers: 2, 3, 5, 7, 11, ? → (13)
- Squared: 1, 4, 9, 16, ? → (25)
- Complex: 1, 2, 4, 7, 11, ? → (16) [add 1, 2, 3, 4, 5...]

#### Game State
```typescript
{
  sequence: number[],        // The visible numbers
  answer: number[],          // The next 1-2 numbers
  patternType: string,       // For server-side validation
  difficulty: 'easy' | 'medium' | 'hard'
}
```

#### Validation
- Compare player answer to generated solution
- Allow small margin of error for complex patterns (±1)
- Verify answer follows the mathematical formula

#### Implementation Notes
- Pre-generate sequences with known formulas
- Store pattern type and formula for validation
- Could show hint: "Arithmetic Pattern" or "Geometric Pattern" (-2 AP)
- Visual: Large, clear numbers with input field

#### Pattern Database
```typescript
const patterns = {
  arithmetic: (n, diff) => n + diff,
  geometric: (n, ratio) => n * ratio,
  fibonacci: (a, b) => a + b,
  squares: (n) => n * n,
  primes: /* prime number generator */,
  // ... more patterns
};
```

#### Theme Integration
- Sequences can represent congressional data:
  - Years of congressional elections
  - Number of representatives over time
  - State admission order numbers
  - Amendment numbers

#### Estimated AP Rewards
- Easy: 6 AP
- Medium: 11 AP
- Hard: 17 AP

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
1. **Lights Out** - Simplest to implement, no external data needed
   - Generate solvable puzzles
   - Implement toggle logic
   - Create Svelte component

### Phase 2: Memory & Logic (Weeks 3-4)
2. **Pattern Memory (Simon Says)** - Fun, interactive, visual
   - Sound/visual feedback
   - Sequence generation
3. **Number Sequence** - Extends existing math theme
   - Pattern generation library
   - Formula validation

### Phase 3: Content-Based Games (Weeks 5-7)
4. **Word Scramble** - Requires word database
   - Build/import word list
   - Implement scrambling algorithm
5. **Rapid Quiz** - Requires question database
   - Build question bank
   - Quiz flow logic

### Phase 4: Advanced Puzzles (Weeks 8-10)
6. **Tile Slider** - Requires image assets and solvability logic
   - Generate solvable configurations
   - Image assets
   - Smooth animations
7. **Code Breaker** - Most complex logic
   - Feedback algorithm
   - Strategy UI

---

## Technical Architecture

### Database Schema Extensions

```sql
-- Extend puzzle_type enum
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'lights_out';
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'pattern_memory';
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'word_scramble';
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'rapid_quiz';
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'tile_slider';
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'code_breaker';
ALTER TYPE puzzle_type ADD VALUE IF NOT EXISTS 'number_sequence';

-- Configure AP rewards per puzzle type and difficulty
CREATE TABLE IF NOT EXISTS puzzle_rewards (
  puzzle_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  base_ap INTEGER NOT NULL,
  time_bonus_ap INTEGER DEFAULT 0,
  perfect_bonus_ap INTEGER DEFAULT 0,
  PRIMARY KEY (puzzle_type, difficulty)
);
```

### Client Component Structure

```
game-client/src/lib/components/puzzle/type/
├── math/                      (existing)
│   └── math.svelte
├── lights-out/
│   └── lights-out.svelte
├── pattern-memory/
│   └── pattern-memory.svelte
├── word-scramble/
│   └── word-scramble.svelte
├── rapid-quiz/
│   └── rapid-quiz.svelte
├── tile-slider/
│   └── tile-slider.svelte
├── code-breaker/
│   └── code-breaker.svelte
└── number-sequence/
    └── number-sequence.svelte
```

### Server-Side Generators

```
supabase/functions/shared/puzzle/
├── math-generator/            (existing)
│   └── math-generator.ts
├── lights-out-generator/
│   └── lights-out-generator.ts
├── pattern-memory-generator/
│   └── pattern-memory-generator.ts
├── word-scramble-generator/
│   └── word-scramble-generator.ts
├── rapid-quiz-generator/
│   └── rapid-quiz-generator.ts
├── tile-slider-generator/
│   └── tile-slider-generator.ts
├── code-breaker-generator/
│   └── code-breaker-generator.ts
└── number-sequence-generator/
    └── number-sequence-generator.ts
```

Each generator must implement the `PuzzleGenerator` interface:
```typescript
interface PuzzleGenerator {
  generate(): { result: Json; puzzle: Json };
  isValid({ result, puzzle }: { result: Json; puzzle: Json }): boolean;
}
```

---

## AP Reward System

### Base Rewards by Difficulty
- **Easy puzzles:** 5-8 AP
- **Medium puzzles:** 9-13 AP
- **Hard puzzles:** 14-22 AP

### Bonus Multipliers
1. **Speed Bonus:** Complete puzzle in < 50% of time limit
   - +20-30% bonus AP
2. **Streak Bonus:** Complete N puzzles in a row
   - 3 streak: +2 AP
   - 5 streak: +5 AP
   - 10 streak: +10 AP
3. **First Time Bonus:** First completion of each puzzle type
   - +10 AP per new type discovered
4. **Perfect Score:** Applicable to quizzes and attempt-limited games
   - +15-25% bonus AP

### Daily Limits (Optional)
Consider limiting AP farming:
- Max 200 AP per day from mini-games
- Or diminishing returns after 10 puzzles per hour

---

## UI/UX Considerations

### Visual Design
- Consistent card-based layout for all puzzles
- Clear timer display (progress bar or countdown)
- Immediate visual feedback for actions
- Success/failure animations
- Score display (current AP, bonus earned)

### Accessibility
- Keyboard navigation for all games
- Screen reader support
- Color-blind friendly palettes
- Adjustable text sizes
- Sound toggle option

### Mobile Optimization
- Touch-friendly targets (min 44x44px)
- Swipe gestures where appropriate
- Portrait and landscape support
- Reduced animations on low-end devices

### Tutorial/Help
- Brief instructions before first play of each type
- "How to play" button accessible during game
- Visual examples in instructions
- Practice mode (no AP reward, no time limit)

---

## Testing Strategy

### Each Mini-Game Needs:
1. **Unit tests** for game logic
   - Validation functions
   - State transitions
   - Win condition detection
2. **Integration tests** for database interactions
   - Puzzle generation
   - Solution verification
   - AP awarding
3. **E2E tests** for user flows
   - Start puzzle
   - Complete successfully
   - Fail and retry
   - Time out
4. **Performance tests**
   - Puzzle generation time < 100ms
   - Client rendering < 16ms per frame
   - Database queries < 50ms

---

## Future Enhancements

### Potential Additions
- **Multiplayer mini-games:** Race against another player
- **Combo challenges:** Complete 3 different puzzle types in sequence for bonus
- **Daily challenges:** Special puzzle of the day with extra rewards
- **Leaderboards:** Top scores for each puzzle type
- **Achievements:** Complete 100 puzzles, speedrun records, etc.
- **Custom difficulty:** Players can adjust parameters for challenge

### Themed Events
- **Election Season:** Quiz questions about current events
- **Historical Week:** Puzzles themed around historical events
- **State Focus:** Puzzles featuring specific states rotating weekly

---

## Conclusion

These mini-game ideas provide diverse, engaging ways for players to earn AP while keeping the gameplay fresh and educational. Starting with **Lights Out** and **Pattern Memory** will give players immediately different experiences from the existing math puzzle, while the content-based games can be added later with proper databases.

Each game is designed to be:
- ✅ Quick and satisfying
- ✅ Fair and validatable
- ✅ Scalable in difficulty
- ✅ Thematically appropriate
- ✅ Fun and replayable

The implementation roadmap allows for incremental development, with simpler games first and more complex ones as the system matures.
