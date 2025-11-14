# Point Level System - Implementation Progress

**Status:** In Progress - Phase 2 Complete
**Started:** 2025-11-14
**Last Updated:** 2025-11-14

## Overview

This document tracks the implementation progress of the Point Level System feature as defined in `point_level_system.md`.

---

## ✅ Phase 1: Database Schema & Configuration - COMPLETE

### Migration File
- **File:** `supabase/migrations/20251114085044_add_point_level_system_phase1.sql`
- **Status:** Created ✅

### Changes Implemented

#### Step 1: Game Table Configuration ✅
Added three new columns to the `game` table:
- `max_point_level` (INTEGER, default: 3) - Maximum level a point can reach
- `health_per_point_level` (INTEGER, default: 255) - Health points per level
- `upgrade_point_ap_cost` (INTEGER, default: 50) - AP cost to upgrade a point

All columns include:
- NOT NULL constraints
- CHECK constraints for valid values
- Descriptive comments

#### Step 2: Point Table Level Column ✅
Added `level` column to the `point` table:
- Type: INTEGER NOT NULL DEFAULT 1
- Constraint: level >= 0 AND level <= 10
- Comment: 'Current level of the point (0 = unclaimed, 1-3 = claimed levels)'

#### Step 3: Existing Points Updated ✅
Migration includes data updates:
- Claimed points: Set to level 1 with max_health = 255
- Unclaimed points: Set to level 0 with max_health = 0
- Non-claimable points: Remain at default level 1

---

## ✅ Phase 2: Database Functions - COMPLETE

### Migration File
- **File:** `supabase/migrations/20251114085045_add_point_level_system_phase2.sql`
- **Status:** Created ✅

### Changes Implemented

#### Step 4: Helper Functions ✅
Created the following SQL helper functions:
1. `get_max_point_level()` - Returns max level from game config
2. `get_health_per_point_level()` - Returns health per level from game config
3. `get_upgrade_point_ap_cost()` - Returns upgrade AP cost from game config
4. `calculate_max_health_for_level(point_level)` - Calculates max health for a given level
5. `can_upgrade_point(p_point_id, p_user_id)` - Validates if a point can be upgraded
   - Checks ownership by user's faction
   - Checks point is at full health
   - Checks point is below max level
   - Checks point type is 'claimable'

#### Step 5: Upgrade Action Function ✅
Created `upgrade_point(p_point_id, p_user_id)` function:
- Validates upgrade eligibility using `can_upgrade_point()`
- Checks user has sufficient AP
- Calculates new level and max_health
- Updates point level, max_health, and health (set to new max)
- Deducts AP from user
- Returns JSONB with success status and new values
- Raises exceptions for validation failures

**Note:** This function is called by the `perform_action` trigger, not directly by users.

#### Step 6: Task Type Enum and Perform Action Updates ✅
1. **Enum Update:** Added 'upgrade' to `task_type` enum
   - Used DO block to check if value exists before adding (idempotent)

2. **Updated `get_ap_cost_for_action()`:** Added upgrade case returning `upgrade_point_ap_cost`

3. **Updated `perform_action()` trigger function:**
   - Added upgrade action handling that calls `upgrade_point()`
   - Modified claim logic to handle level 0 points:
     - Sets level to 1
     - Sets max_health to `health_per_point_level`
     - Sets health to half of max_health (128 for default 255)
     - Sets acquired_by to user's faction
   - Modified attack_and_claim capture logic:
     - Resets captured points to level 1
     - Sets health to half max (128 for default)
   - Maintains existing attack and repair logic
   - All actions validated for claimable point type
   - AP checking and spending handled consistently

---

## 🔄 Phase 3: Backend API - TODO

### Tasks Remaining

#### Step 7: Update Action Insertion ⏳
- No direct changes needed - actions table already handles inserts
- Verify edge function `perform_action` works with new 'upgrade' type

#### Step 8: Add Level Data to Existing Queries ⏳
- Update queries that fetch point data to include `level` column
- Check `game` queries include new config columns

#### Step 9: Update TypeScript Types ⏳
- Run `./update_db_types.sh` to regenerate types from database
- Verify `Point` interface includes `level` field
- Verify `GameConfig` interface includes new fields:
  - `max_point_level`
  - `health_per_point_level`
  - `upgrade_point_ap_cost`

---

## 🔄 Phase 4: Client UI - Point Display - TODO

### Tasks Remaining

#### Step 10: Update Point Display Components ⏳
File: `game-client/src/lib/components/point-stats.svelte`
- Add level badge display
- Add visual styling for different levels
- Show level information in point stats

#### Step 11: Update Point Info Panels ⏳
- Display current level prominently
- Show "can upgrade" indicator when conditions met
- Display health bar with level-adjusted max health
- Show upgrade availability status

---

## 🔄 Phase 5: Client UI - Upgrade Action - TODO

### Tasks Remaining

#### Step 12: Create Upgrade UI Components ⏳
- Create upgrade button component
- Add confirmation dialog for upgrade action
- Display upgrade requirements (full health, AP cost)
- Show disabled state with reason when upgrade not available

#### Step 13: Implement Upgrade Action Handler ⏳
File: `game-client/src/lib/supabase/actions.ts`
- Already supports generic action types via `performAction()`
- Add 'upgrade' to TaskType if not present
- Update `getActionPointCost()` to handle 'upgrade' type

File: `game-client/src/lib/components/task/task-overview.svelte`
- Add upgrade to possible tasks when conditions met:
  - User owns point
  - Point at full health
  - Point below max level
- Display upgrade button with AP cost
- Handle upgrade action errors

#### Step 14: Update AP Display ⏳
- Verify AP display shows upgrade costs correctly
- Ensure AP updates after upgrade action

---

## 🔄 Phase 6: Client UI - Level 0 Points - TODO

### Tasks Remaining

#### Step 15: Update Claim Behavior for Level 0 Points ⏳
- Distinguish between level 0 unclaimed points and captured points
- Update UI to show "This point is unclaimed and at level 0"
- Show claim button for level 0 points
- Update claim confirmation message for level 0 vs captured points

---

## 🔄 Phase 7: Admin Interface - TODO

### Tasks Remaining

#### Step 16: Add Level Management to Admin Pages ⏳
- Display point levels in admin views
- Show upgrade history/stats
- Admin tools to view level distribution

#### Step 17: Add Level Initialization Tools ⏳
- Admin function to bulk update point levels if needed
- Tools to adjust game config (max level, health per level, upgrade cost)

---

## 🔄 Phase 8: Testing & Validation - TODO

### Backend Testing Required

#### Step 18: Backend Testing ⏳
Test the following scenarios:
1. **Helper Functions**
   - `get_max_point_level()` returns correct value
   - `calculate_max_health_for_level()` calculates correctly (255, 510, 765 for levels 1-3)
   - `can_upgrade_point()` validates all conditions

2. **Upgrade Action**
   - Successful upgrade from level 1 to 2
   - Successful upgrade from level 2 to 3
   - Failed upgrade: insufficient AP
   - Failed upgrade: not at full health
   - Failed upgrade: already at max level
   - Failed upgrade: point not owned by user's faction
   - Failed upgrade: non-claimable point type

3. **Level 0 Claim**
   - Claiming level 0 point sets level to 1
   - Claim sets health to half of max (128)
   - Claim sets max_health to 255

4. **Point Capture Reset**
   - Capturing enemy point resets to level 1
   - Captured point health set to half (128)
   - Captured point max_health set to 255

### Client Testing Required

#### Step 19: Client Testing ⏳
1. **UI Display**
   - Level badges display correctly
   - Health bars show correct max health for level
   - Point info shows accurate level data

2. **Upgrade Action**
   - Upgrade button shows only when conditions met
   - Upgrade button shows AP cost
   - Upgrade confirmation dialog works
   - Successful upgrade updates UI immediately
   - Error messages display correctly

3. **Level 0 Points**
   - Unclaimed points show as level 0
   - Claim button available for level 0 points
   - Claiming level 0 point works correctly

### Integration Testing Required

#### Step 20: Integration Testing ⏳
1. Full gameplay flow: claim → upgrade → defend → capture
2. Multi-user scenarios at different point levels
3. AP economy balance with upgrade costs
4. Database triggers and edge functions working together

---

## 🔄 Phase 9: Documentation & Deployment - TODO

### Tasks Remaining

#### Step 21: Update User Documentation ⏳
- Document point level system for players
- Explain upgrade mechanics
- Show AP costs and level benefits

#### Step 22: Create Migration Rollback Plan ⏳
- Document rollback procedure
- Create rollback migrations if needed
- Test rollback process

#### Step 23: Deploy in Stages ⏳
- Deploy Phase 1 & 2 (database) first
- Test in production
- Deploy Phase 3-6 (backend & client) next
- Monitor for issues
- Full rollout

---

## Architecture Notes

### Action System Integration
The upgrade action follows the existing action pattern:
1. User clicks upgrade button in client
2. Client calls edge function `perform_action` with type='upgrade'
3. Edge function validates user and inserts into `actions` table
4. `perform_action` trigger fires on insert
5. Trigger calls `upgrade_point()` function
6. Function validates conditions and performs upgrade
7. AP is deducted, point is upgraded
8. Client receives success/error response

### Key Design Decisions
- **Level 0 = Unclaimed:** Makes point state clearer
- **Capture Resets Level:** Prevents runaway point dominance
- **Full Health Required:** Strategic requirement for upgrades
- **Half Health on Claim/Capture:** Balances initial point strength
- **Consistent Action Pattern:** All actions use same insert-trigger flow

### Database Schema
- `point.level`: 0-10 (validated against game.max_point_level)
- `point.max_health`: Calculated as level * health_per_point_level
- `game.max_point_level`: Default 3 (configurable)
- `game.health_per_point_level`: Default 255 (configurable)
- `game.upgrade_point_ap_cost`: Default 50 (configurable)

---

## Next Steps

1. **Apply Migrations:**
   ```bash
   cd supabase
   supabase migration up
   ```

2. **Regenerate TypeScript Types:**
   ```bash
   ./update_db_types.sh
   ```

3. **Verify Backend:**
   - Test upgrade action in database
   - Test level 0 claim behavior
   - Test capture reset behavior

4. **Implement Client UI (Phase 4-6):**
   - Update point display components
   - Add upgrade button and logic
   - Handle level 0 points in UI

5. **Testing:**
   - Backend integration tests
   - Client UI tests
   - Full gameplay flow tests

6. **Deploy:**
   - Stage 1: Database migrations
   - Stage 2: Backend + Client updates
   - Stage 3: Documentation and monitoring

---

## Issues & Notes

### Current State
- ✅ Database schema ready
- ✅ Database functions implemented
- ✅ perform_action trigger updated
- ⏳ TypeScript types need regeneration
- ⏳ Client UI needs updates
- ⏳ Testing required

### Known Considerations
- **AP Balance:** Default 50 AP for upgrade may need tuning
- **Capture Strategy:** Level reset on capture creates interesting dynamics
- **Max Level:** Default 3 levels, but system supports up to 10
- **Health Scaling:** Linear scaling (255, 510, 765) - may want exponential?

### Future Enhancements (Post-MVP)
- Level-based AP generation bonuses
- Visual effects for different levels
- Level-based special abilities
- Upgrade animation/feedback
- Leaderboards by controlled point levels