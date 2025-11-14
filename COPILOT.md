# Congress Ingress Project Knowledge

## Database Schema

- **Points** are central game objects. Each point has:
  - `id`, `name`, `max_health`, `health`, `acquired_by` (faction), `type` (enum: `claimable`, `not_claimable`), `level` (integer, default 1)
- **Point Types** are managed via a PostgreSQL enum (`public.point_type`).
  - Only points with `type = 'claimable'` can have actions performed on them (attack, claim, repair).
- **Actions** are stored in the `actions` table, referencing points and users.
- **Factions** are stored in the `faction` table.
- **User roles** are managed via the `user_role` table and a `role` enum (`user`, `admin`).
- **Game state** and configuration are stored in the `game` table.
- **Puzzles** are used for gaining AP at mini-game points, but not required for actions.

## Game Logic

- The `perform_action` trigger/function only allows actions on points with `type = 'claimable'` and automatically handles AP spending.
- Claiming, attacking, repairing, and upgrading are implemented as types in the `task_type` enum.
- **All actions** (attack, claim, repair, upgrade) are performed by inserting rows into the `actions` table, which triggers the `perform_action` function.
- Users do not call upgrade functions directly - upgrades happen through the action mechanism.
- Experience points are rewarded via the `actions` table and accumulated in `user_game_data`.
- Actions no longer require puzzles - puzzles are only used for gaining AP at mini-game points.

## Client (Svelte)

- The client uses SvelteKit and Supabase for real-time updates and authentication.
- **Point type** is checked in the UI before showing possible actions.
- Only claimable points show action buttons; non-claimable points display a warning.
- Admin pages display the point type for each point.

## Conventions

- Database migrations are stored in `supabase/migrations/`.
- TypeScript types are generated from the database schema and used throughout the client.
- All business logic (claiming, attacking, repairing) is enforced both in the backend (SQL/PLPGSQL) and the frontend (Svelte).

## Action Points (AP) System

- **AP Storage:** Action points are stored in `user_game_data.action_points` (integer, default 0)
- **AP Gaining:** Users gain AP by solving puzzles at mini-game points via the `gain_ap_on_puzzle_solve()` trigger
- **AP Spending:** Users spend AP when performing actions on claimable points via the `perform_action()` trigger
- **AP Configuration:**
  - Max AP per user stored in `game.max_ap` (default 255)
  - AP gain per puzzle type stored in `puzzle_config.ap_gain`
  - AP costs per action type stored in `game` table:
    - `attack_ap_cost` (default 10)
    - `claim_ap_cost` (default 15)
    - `repair_ap_cost` (default 8)
    - `attack_and_claim` costs both attack + claim AP
- **AP Functions:**
  - `get_max_action_points()` - returns max AP from game config
  - `get_ap_gain_for_puzzle_type(puzzle_type)` - returns AP gain for specific puzzle type
  - `gain_ap_on_puzzle_solve()` - trigger that awards AP when puzzles are solved
  - `get_ap_cost_for_action(task_type)` - returns AP cost for specific action type
  - `user_has_enough_ap(user_id, task_type)` - checks if user can afford action
  - `spend_ap_for_action(user_id, task_type)` - deducts AP for action
  - `get_user_current_ap(user_id)` - returns user's current AP
  - `can_user_afford_action(user_id, task_type)` - AP affordability check (no timeout)
- **Client Integration:**
  - User's current AP is available in `user.user.actionPoints` (reactive store)
  - AP updates in real-time via Supabase realtime channel
  - UI components use the store directly instead of separate API calls

## Point Level System

The Point Level System adds strategic depth through base-building mechanics, health scaling, and upgrade/capture rules.

- **Level Storage:** Each point has a `level` field (integer, default 1) stored in the `points` table
- **Level Range:** Points can be levels 0-3 (default max level is 3, configurable via `game.max_point_level`)
- **Health Scaling:** Each level increases the point's max health by a fixed amount (default: 255 HP per level)
  - Level 1: 255 max HP
  - Level 2: 510 max HP
  - Level 3: 765 max HP
  - Health per level is configurable via `game.health_per_point_level`
- **Upgrade Mechanism:**
  - Upgrades are performed via the action mechanism (insert into `actions` table with type `upgrade`)
  - Points can only be upgraded when at **full health** (health = max_health)
  - Upgrading increases `max_health` but leaves `health` unchanged, requiring repair to reach new maximum
  - Upgrade AP cost is significant (default: 50 AP, configurable via `game.upgrade_point_ap_cost`)
  - Only the owning faction can upgrade their points
  - The `perform_action` trigger handles all upgrade logic and validation
- **Level 0 Behavior:**
  - Unclaimed points start at level 0
  - Level 0 points can be **claimed immediately** without reducing health to zero
  - After claiming, the point becomes level 1 with half max health (128 HP by default)
- **Capture Rule:**
  - When a point is captured by another faction, it **resets to level 1**
  - Health is set to half of level 1 max health (128 HP by default)
  - This prevents instant benefit from previous upgrades and encourages ongoing conflict
  - The new owner must invest resources to rebuild the point
- **Strategic Implications:**
  - High-level points are more difficult to capture (more health to destroy)
  - Upgrading points is a significant AP investment that encourages group coordination
  - Attack and repair mechanics naturally promote team play
  - Point levels are visible to all players for strategic planning
- **Configuration Parameters:**
  - `game.max_point_level` - maximum level points can reach (default: 3)
  - `game.health_per_point_level` - HP added per level (default: 255)
  - `game.upgrade_point_ap_cost` - AP cost to upgrade a point (default: 50+)
- **Implementation Guide:** See `/documentation/implementation/point_level_system.md` for detailed step-by-step implementation instructions

## Indoor Geo location

- Game works indoor
- No GPS available
- No WIFI location, because it is in the browser
- **QR Code / Physical Code System (Recommended)**
  - QR Codes are used to check if a user is at a specific point.

## Quick Reference

- **Point type enum:** `CREATE TYPE public.point_type AS ENUM ('claimable', 'not_claimable', 'mini_game');`
- **Actions restricted:** Only on points with `type = 'claimable'`, no puzzles required
- **UI logic:** Action buttons hidden for non-claimable points
- **AP system:** Users gain AP at mini-game points, spend AP at claimable points and upgrades
- **AP enforcement:** The `perform_action()` trigger checks AP before allowing actions and automatically deducts costs
- **Client AP:** Current AP available in user store (`user.user.actionPoints`) with real-time updates
- **Point levels:** Points have levels (1-3 default) that scale max health; upgrades cost AP and require full health
- **Capture rule:** Captured points reset to level 1 with 128 HP, requiring rebuilding by new owner
- **Level 0 points:** Can be claimed immediately, become level 1 at 128 HP after claiming
