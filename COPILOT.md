# Congress Ingress Project Knowledge

## Database Schema

- **Points** are central game objects. Each point has:
  - `id`, `name`, `max_health`, `health`, `acquired_by` (faction), `type` (enum: `claimable`, `not_claimable`)
- **Point Types** are managed via a PostgreSQL enum (`public.point_type`).
  - Only points with `type = 'claimable'` can have actions performed on them (attack, claim, repair).
- **Actions** are stored in the `actions` table, referencing points and users.
- **Factions** are stored in the `faction` table.
- **User roles** are managed via the `user_role` table and a `role` enum (`user`, `admin`).
- **Game state** and configuration are stored in the `game` table.
- **Puzzles** are used for gaining AP at mini-game points, but not required for actions.

## Game Logic

- The `perform_action` trigger/function only allows actions on points with `type = 'claimable'` and automatically handles AP spending.
- Claiming, attacking, and repairing are implemented as types in the `task_type` enum.
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

## Quick Reference

- **Point type enum:** `CREATE TYPE public.point_type AS ENUM ('claimable', 'not_claimable', 'mini_game');`
- **Actions restricted:** Only on points with `type = 'claimable'`, no puzzles required
- **UI logic:** Action buttons hidden for non-claimable points
- **AP system:** Users gain AP at mini-game points, spend AP at claimable points
- **AP enforcement:** The `perform_action()` trigger checks AP before allowing actions and automatically deducts costs
- **Client AP:** Current AP available in user store (`user.user.actionPoints`) with real-time updates
