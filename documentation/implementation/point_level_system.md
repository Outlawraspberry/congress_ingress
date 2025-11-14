# Point Level System - Implementation Guide

**Status:** Ready for Implementation
**Last Updated:** 2025-01-14
**Related Concept:** See `/documentation/concepts/2025_11_14_point_level.md`

## Overview

This guide provides a step-by-step implementation plan for the Point Level System feature in Congress Ingress. The system adds strategic depth through base-building mechanics, health scaling, and upgrade/capture rules.

## Important: Action Mechanism Architecture

**Critical Design Decision:** Upgrades follow the same pattern as all other actions (attack, claim, repair) in Congress Ingress:

- Users **do not call upgrade functions directly** via RPC
- Instead, users insert a row into the `actions` table with type `upgrade`
- The `perform_action` trigger/function handles all upgrade logic, validation, and AP deduction
- This maintains consistency with the existing action system architecture

This guide is written with this architecture in mind. The "upgrade_point" function mentioned in Phase 2 is called **by the trigger**, not by users.

## Prerequisites
</parameter>
</invoke>

Before starting implementation:
- Understand the Point Level System concept and design decisions
- Review `COPILOT.md` for current system architecture
- Ensure development environment is set up with Supabase access
- Backup database before applying migrations

---

## Phase 1: Database Schema & Configuration

### Step 1: Add Configuration Columns to `game` Table

Create a new migration file in `supabase/migrations/`:

```sql
-- Add point level configuration to game table
ALTER TABLE public.game
ADD COLUMN max_point_level INTEGER NOT NULL DEFAULT 3,
ADD COLUMN health_per_point_level INTEGER NOT NULL DEFAULT 255,
ADD COLUMN upgrade_point_ap_cost INTEGER NOT NULL DEFAULT 50;

COMMENT ON COLUMN game.max_point_level IS 'Maximum level a point can be upgraded to';
COMMENT ON COLUMN game.health_per_point_level IS 'Health points added per level';
COMMENT ON COLUMN game.upgrade_point_ap_cost IS 'Action points required to upgrade a point';
```

### Step 2: Add `level` Column to `points` Table

```sql
-- Add level column to points table
ALTER TABLE public.points
ADD COLUMN level INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN points.level IS 'Current level of the point (0 = unclaimed, 1-3 = claimed levels)';

-- Add constraint to ensure level is within valid range
ALTER TABLE public.points
ADD CONSTRAINT points_level_valid CHECK (level >= 0 AND level <= 3);
```

### Step 3: Update Existing Points

```sql
-- Initialize all existing points to level 1 with proper max_health
UPDATE public.points
SET level = 1,
    max_health = 255
WHERE type = 'claimable';

-- Set unclaimed points to level 0
UPDATE public.points
SET level = 0
WHERE acquired_by IS NULL AND type = 'claimable';
```

**Verification:**
- Run `SELECT level, COUNT(*) FROM points GROUP BY level;` to verify distribution
- Ensure no points have invalid level values

---

## Phase 2: Database Functions

### Step 4: Create Helper Functions

```sql
-- Get max point level from game config
CREATE OR REPLACE FUNCTION get_max_point_level()
RETURNS INTEGER AS $$
  SELECT max_point_level FROM public.game LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Get health per point level from game config
CREATE OR REPLACE FUNCTION get_health_per_point_level()
RETURNS INTEGER AS $$
  SELECT health_per_point_level FROM public.game LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Get upgrade AP cost from game config
CREATE OR REPLACE FUNCTION get_upgrade_point_ap_cost()
RETURNS INTEGER AS $$
  SELECT upgrade_point_ap_cost FROM public.game LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Calculate max health for a given level
CREATE OR REPLACE FUNCTION calculate_max_health_for_level(point_level INTEGER)
RETURNS INTEGER AS $$
  SELECT point_level * get_health_per_point_level();
$$ LANGUAGE SQL STABLE;

-- Check if a point can be upgraded
CREATE OR REPLACE FUNCTION can_upgrade_point(p_point_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_point RECORD;
  v_user_faction_id UUID;
  v_max_level INTEGER;
BEGIN
  -- Get point data
  SELECT * INTO v_point FROM public.points WHERE id = p_point_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get user's faction
  SELECT faction_id INTO v_user_faction_id
  FROM public.user_game_data
  WHERE user_id = p_user_id;

  -- Get max level
  v_max_level := get_max_point_level();

  -- Check all conditions
  RETURN (
    v_point.acquired_by = v_user_faction_id AND  -- User owns point
    v_point.health = v_point.max_health AND      -- Point at full health
    v_point.level < v_max_level AND              -- Not at max level
    v_point.type = 'claimable'                   -- Is claimable type
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### Step 5: Create Upgrade Action Function

**Note:** This function is called by the `perform_action` trigger when a user inserts an `upgrade` action into the `actions` table. Users do not call this function directly.

```sql
-- Main upgrade point function (called by perform_action trigger)
CREATE OR REPLACE FUNCTION upgrade_point(p_point_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_point RECORD;
  v_user_faction_id UUID;
  v_user_ap INTEGER;
  v_upgrade_cost INTEGER;
  v_new_level INTEGER;
  v_new_max_health INTEGER;
BEGIN
  -- Check if upgrade is allowed
  IF NOT can_upgrade_point(p_point_id, p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Point cannot be upgraded (check ownership, health, and level)'
    );
  END IF;

  -- Get upgrade cost
  v_upgrade_cost := get_upgrade_point_ap_cost();

  -- Get user's current AP
  SELECT action_points INTO v_user_ap
  FROM public.user_game_data
  WHERE user_id = p_user_id;

  -- Check if user has enough AP
  IF v_user_ap < v_upgrade_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient action points'
    );
  END IF;

  -- Get current point data
  SELECT * INTO v_point FROM public.points WHERE id = p_point_id;

  -- Calculate new values
  v_new_level := v_point.level + 1;
  v_new_max_health := calculate_max_health_for_level(v_new_level);

  -- Update point
  UPDATE public.points
  SET level = v_new_level,
      max_health = v_new_max_health
  WHERE id = p_point_id;

  -- Deduct AP
  UPDATE public.user_game_data
  SET action_points = action_points - v_upgrade_cost
  WHERE user_id = p_user_id;

  -- Note: Action recording is handled by the perform_action trigger
  -- which calls this function, so no need to insert into actions table here

  RETURN jsonb_build_object(
    'success', true,
    'new_level', v_new_level,
    'new_max_health', v_new_max_health,
    'ap_spent', v_upgrade_cost
  );
END;
$$ LANGUAGE plpgsql;
```

### Step 6: Update `task_type` Enum and `perform_action` Function

First, add the `upgrade` action type to the enum:

```sql
-- Add upgrade to task_type enum
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'upgrade';
```

Then update the `perform_action` trigger/function to handle upgrades, level 0 claims, and point capture resets:

```sql
-- Update perform_action function to include upgrade logic
-- This is a conceptual example - adapt to your existing perform_action function
CREATE OR REPLACE FUNCTION perform_action()
RETURNS TRIGGER AS $$
DECLARE
  v_action_type task_type;
  v_point RECORD;
  v_user_faction_id UUID;
  v_ap_cost INTEGER;
  v_upgrade_result JSONB;
BEGIN
  -- Get action details
  v_action_type := NEW.task_type;
  
  -- Get point and user info
  SELECT * INTO v_point FROM public.points WHERE id = NEW.point_id;
  SELECT faction_id INTO v_user_faction_id 
  FROM public.user_game_data 
  WHERE user_id = NEW.user_id;
  
  -- Handle different action types
  CASE v_action_type
    WHEN 'upgrade' THEN
      -- Validate and perform upgrade
      v_upgrade_result := upgrade_point(NEW.point_id, NEW.user_id);
      
      IF NOT (v_upgrade_result->>'success')::boolean THEN
        RAISE EXCEPTION 'Upgrade failed: %', v_upgrade_result->>'error';
      END IF;
      
    WHEN 'claim' THEN
      -- Handle level 0 claim
      IF v_point.level = 0 THEN
        UPDATE points 
        SET level = 1,
            max_health = get_health_per_point_level(),
            health = get_health_per_point_level() / 2,
            acquired_by = v_user_faction_id
        WHERE id = NEW.point_id;
      ELSE
        -- Normal claim logic (point health reached 0)
        -- ... existing claim logic ...
      END IF;
      
    -- ... other action types (attack, repair) ...
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Modify the existing capture handler or add to perform_action
CREATE OR REPLACE FUNCTION handle_point_capture()
RETURNS TRIGGER AS $$
BEGIN
  -- When a point changes ownership (captured)
  IF OLD.acquired_by IS NOT NULL AND NEW.acquired_by != OLD.acquired_by THEN
    -- Reset to level 1 with half health
    NEW.level := 1;
    NEW.max_health := get_health_per_point_level();
    NEW.health := NEW.max_health / 2;  -- 128 HP for default 255/level
  END IF;

  -- When claiming a level 0 point
  IF OLD.level = 0 AND NEW.acquired_by IS NOT NULL THEN
    NEW.level := 1;
    NEW.max_health := get_health_per_point_level();
    NEW.health := NEW.max_health / 2;  -- Start at half health
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
-- Apply trigger
DROP TRIGGER IF EXISTS perform_action_trigger ON public.actions;
CREATE TRIGGER perform_action_trigger
  BEFORE INSERT ON public.actions
  FOR EACH ROW
  EXECUTE FUNCTION perform_action();

-- Trigger for handling point captures (when ownership changes)
DROP TRIGGER IF EXISTS point_capture_handler ON public.points;
CREATE TRIGGER point_capture_handler
  BEFORE UPDATE ON public.points
  FOR EACH ROW
  WHEN (OLD.acquired_by IS DISTINCT FROM NEW.acquired_by)
  EXECUTE FUNCTION handle_point_capture();
```

**Testing:**
- Test upgrade with valid conditions
- Test upgrade with insufficient AP
- Test upgrade at max level (should fail)
- Test upgrade without full health (should fail)
- Test level 0 claim behavior
- Test capture reset behavior

---

## Phase 3: Backend API

### Step 7: Update Action Insertion (No Direct RPC Needed)

**Important:** Users do not call an RPC function for upgrades. Instead, they insert into the `actions` table:

**Client Usage Example:**
```typescript
// Insert upgrade action into actions table
const { data, error } = await supabase
  .from('actions')
  .insert({
    user_id: userId,
    point_id: pointId,
    task_type: 'upgrade'
  });

// The perform_action trigger will:
// 1. Validate the upgrade
// 2. Check and deduct AP
// 3. Perform the upgrade
// 4. Return success or throw an error
```

No RPC function exposure is needed - the trigger handles everything.
</text>

<old_text line=495>
### Step 13: Implement Upgrade Action Handler

**File:** `game-client/src/lib/actions/upgradePoint.ts`

```typescript
import { supabase } from '$lib/supabase';
import { toast } from '$lib/stores/toast';

export async function upgradePoint(pointId: string, userId: string) {
  try {
    const { data, error } = await supabase.rpc('upgrade_point', {
      p_point_id: pointId,
      p_user_id: userId
    });
    
    if (error) throw error;
    
    if (data.success) {
      toast.success(`Point upgraded to Level ${data.new_level}!`);
      return { success: true, data };
    } else {
      toast.error(data.error || 'Upgrade failed');
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.error('Upgrade error:', err);
    toast.error('Failed to upgrade point');
    return { success: false, error: err };
  }
}
```

### Step 8: Add Level Data to Existing Queries

Update any existing queries or views that fetch point data:

```sql
-- Example: Update point view to include level
CREATE OR REPLACE VIEW points_with_details AS
SELECT
  p.*,
  p.level,
  p.max_health,
  p.health,
  ROUND((p.health::NUMERIC / p.max_health::NUMERIC) * 100) as health_percentage,
  f.name as faction_name
FROM points p
LEFT JOIN faction f ON p.acquired_by = f.id;
```

### Step 9: Update TypeScript Types

```bash
# Regenerate TypeScript types from Supabase schema
cd congress-ingress
./update_db_types.sh
```

**Manual Type Updates (if needed):**

```typescript
// types/database.types.ts (should be auto-generated)
export interface Point {
  id: string;
  name: string;
  level: number;  // NEW
  health: number;
  max_health: number;
  acquired_by: string | null;
  type: 'claimable' | 'not_claimable' | 'mini_game';
  // ... other fields
}

export interface GameConfig {
  max_point_level: number;      // NEW
  health_per_point_level: number; // NEW
  upgrade_point_ap_cost: number;  // NEW
  // ... other fields
}
```

---

## Phase 4: Client UI - Point Display

### Step 10: Update Point Display Components

**File:** `game-client/src/lib/components/map/PointMarker.svelte`

```svelte
<script lang="ts">
  import type { Point } from '$lib/types';

  export let point: Point;

  $: levelBadge = point.level > 0 ? `L${point.level}` : 'Unclaimed';
</script>

<div class="point-marker" class:level-{point.level}>
  <div class="level-badge">{levelBadge}</div>
  <!-- existing marker content -->
</div>

<style>
  .level-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--color-primary);
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: bold;
  }

  /* Optional: Different colors per level */
  .level-1 { border-color: #4CAF50; }
  .level-2 { border-color: #2196F3; }
  .level-3 { border-color: #9C27B0; }
</style>
```

### Step 11: Update Point Info Panels

**File:** `game-client/src/lib/components/point/PointDetail.svelte`

```svelte
<script lang="ts">
  import type { Point, GameConfig } from '$lib/types';
  import { gameConfig } from '$lib/stores/game';

  export let point: Point;

  $: maxLevel = $gameConfig?.max_point_level ?? 3;
  $: healthPerLevel = $gameConfig?.health_per_point_level ?? 255;
  $: calculatedMaxHealth = point.level * healthPerLevel;
</script>

<div class="point-detail">
  <h2>{point.name}</h2>

  <div class="level-info">
    <span class="level">Level {point.level} / {maxLevel}</span>
    {#if point.level < maxLevel}
      <span class="upgrade-available">⬆️ Upgradeable</span>
    {/if}
  </div>

  <div class="health-info">
    <div class="health-bar">
      <div class="health-fill" style="width: {(point.health / point.max_health) * 100}%"></div>
    </div>
    <span class="health-text">
      {point.health} / {point.max_health} HP
      {#if point.max_health !== calculatedMaxHealth}
        <small>(Expected: {calculatedMaxHealth})</small>
      {/if}
    </span>
  </div>

  <!-- existing detail content -->
</div>
```

---

## Phase 5: Client UI - Upgrade Action

### Step 12: Create Upgrade UI Components

**File:** `game-client/src/lib/components/point/UpgradeButton.svelte`

```svelte
<script lang="ts">
  import { user } from '$lib/stores/user';
  import { gameConfig } from '$lib/stores/game';
  import type { Point } from '$lib/types';

  export let point: Point;

  $: upgradeCost = $gameConfig?.upgrade_point_ap_cost ?? 50;
  $: userAP = $user?.actionPoints ?? 0;
  $: maxLevel = $gameConfig?.max_point_level ?? 3;

  $: canUpgrade = (
    point.health === point.max_health &&
    point.level < maxLevel &&
    userAP >= upgradeCost &&
    point.acquired_by === $user?.factionId
  );

  $: disabledReason = getDisabledReason();

  function getDisabledReason(): string | null {
    if (point.acquired_by !== $user?.factionId) return "Not your faction's point";
    if (point.level >= maxLevel) return "Already at max level";
    if (point.health < point.max_health) return "Point must be at full health";
    if (userAP < upgradeCost) return `Insufficient AP (need ${upgradeCost})`;
    return null;
  }

  let showConfirm = false;

  function handleUpgrade() {
    showConfirm = true;
  }
</script>

<button
  class="upgrade-button"
  disabled={!canUpgrade}
  on:click={handleUpgrade}
  title={disabledReason ?? 'Upgrade this point'}
>
  ⬆️ Upgrade (Cost: {upgradeCost} AP)
</button>

{#if showConfirm}
  <div class="confirm-dialog">
    <p>Upgrade {point.name} to Level {point.level + 1}?</p>
    <p>Cost: {upgradeCost} AP</p>
    <button on:click={() => dispatch('confirm')}>Confirm</button>
    <button on:click={() => showConfirm = false}>Cancel</button>
  </div>
{/if}
```

### Step 13: Implement Upgrade Action Handler

**Important:** Upgrades are performed by inserting into the `actions` table, not by calling an RPC function. The `perform_action` trigger handles all the logic.

**File:** `game-client/src/lib/actions/upgradePoint.ts`

```typescript
import { supabase } from '$lib/supabase';
import { toast } from '$lib/stores/toast';

export async function upgradePoint(pointId: string, userId: string) {
  try {
    // Insert upgrade action into actions table
    // The perform_action trigger will handle validation, AP deduction, and upgrade logic
    const { data, error } = await supabase
      .from('actions')
      .insert({
        user_id: userId,
        point_id: pointId,
        task_type: 'upgrade'
      })
      .select()
      .single();

    if (error) {
      // Error from trigger (e.g., insufficient AP, point not at full health)
      toast.error(error.message || 'Upgrade failed');
      return { success: false, error: error.message };
    }

    // Success - the trigger performed the upgrade
    toast.success('Point upgraded successfully!');
    return { success: true, data };
  } catch (err) {
    console.error('Upgrade error:', err);
    toast.error('Failed to upgrade point');
    return { success: false, error: err };
  }
}
```

### Step 14: Update AP Display

Add upgrade cost to AP calculation displays wherever AP costs are shown.

---

## Phase 6: Client UI - Level 0 Points

### Step 15: Update Claim Behavior for Level 0 Points

**File:** `game-client/src/lib/components/point/PointActions.svelte`

```svelte
<script lang="ts">
  import type { Point } from '$lib/types';

  export let point: Point;

  $: isLevelZero = point.level === 0;
  $: isUnclaimed = point.acquired_by === null;
</script>

<div class="point-actions">
  {#if isLevelZero && isUnclaimed}
    <div class="unclaimed-notice">
      <span>🏳️ Unclaimed Territory</span>
    </div>
    <button class="claim-button" on:click={() => dispatch('claim')}>
      Claim Point
    </button>
  {:else if point.acquired_by === $user?.factionId}
    <!-- Repair and Upgrade buttons -->
  {:else}
    <!-- Attack button -->
  {/if}
</div>
```

---

## Phase 7: Admin Interface

### Step 16: Add Level Management to Admin Pages

**File:** `game-client/src/routes/admin/points/+page.svelte`

Add level column to admin point table and allow editing.

### Step 17: Add Level Initialization Tools

**File:** `game-client/src/routes/admin/config/+page.svelte`

Add configuration controls for:
- `max_point_level`
- `health_per_point_level`
- `upgrade_point_ap_cost`

---

## Phase 8: Testing & Validation

### Step 18: Backend Testing

Create test cases in `supabase/tests/` or manually test. **Remember:** Users trigger actions by inserting into the `actions` table, not by calling functions directly.

```sql
-- Test 1: Upgrade with valid conditions (point at full health, user has AP)
-- First, set up a valid scenario
UPDATE points SET health = max_health, level = 1 WHERE id = '<point_id>';
UPDATE user_game_data SET action_points = 100 WHERE user_id = '<user_id>';

-- Then insert upgrade action (this triggers perform_action)
INSERT INTO actions (user_id, point_id, task_type)
VALUES ('<user_id>', '<point_id>', 'upgrade');

-- Verify the upgrade worked
SELECT level, max_health, health FROM points WHERE id = '<point_id>';
-- Should show level = 2, max_health = 510, health still at 255

-- Test 2: Upgrade without full health (should fail with error from trigger)
UPDATE points SET health = max_health - 10 WHERE id = '<point_id>';

INSERT INTO actions (user_id, point_id, task_type)
VALUES ('<user_id>', '<point_id>', 'upgrade');
-- Should fail with error message

-- Test 3: Upgrade at max level (should fail)
UPDATE points SET level = 3, health = 765, max_health = 765 WHERE id = '<point_id>';

INSERT INTO actions (user_id, point_id, task_type)
VALUES ('<user_id>', '<point_id>', 'upgrade');
-- Should fail with error message

-- Test 4: Level 0 claim
-- Create/set a level 0 point
UPDATE points SET level = 0, acquired_by = NULL WHERE id = '<point_id>';

-- Insert claim action
INSERT INTO actions (user_id, point_id, task_type)
VALUES ('<user_id>', '<point_id>', 'claim');

-- Verify it becomes level 1 with 128 HP
SELECT level, health, max_health, acquired_by FROM points WHERE id = '<point_id>';
-- Should show level = 1, health = 128, max_health = 255

-- Test 5: Capture reset
-- Set up a high-level point owned by one faction
UPDATE points 
SET level = 3, health = 765, max_health = 765, acquired_by = '<faction_a_id>' 
WHERE id = '<point_id>';

-- Attack until health is 0, then claim by different faction
-- (This simulates the capture process)
UPDATE points SET health = 0 WHERE id = '<point_id>';

INSERT INTO actions (user_id, point_id, task_type)
VALUES ('<faction_b_user_id>', '<point_id>', 'claim');

-- Verify it resets to level 1 with 128 HP
SELECT level, health, max_health, acquired_by FROM points WHERE id = '<point_id>';
-- Should show level = 1, health = 128, max_health = 255, acquired_by = '<faction_b_id>'
```

### Step 19: Client Testing

Test checklist:
- [ ] Level badges display correctly on map
- [ ] Point detail shows accurate level and health info
- [ ] Upgrade button enables/disables correctly
- [ ] Upgrade action works and updates UI
- [ ] AP deduction happens correctly
- [ ] Real-time updates work when other users upgrade
- [ ] Level 0 points show claim option
- [ ] Health bars scale correctly for different levels

### Step 20: Integration Testing

Full cycle tests:
1. Repair point to full health
2. Upgrade point (verify AP spent, level increased, max health increased)
3. Repair to new max health
4. Repeat until max level
5. Attack and capture high-level point
6. Verify it resets to level 1 with 128 HP

---

## Phase 9: Documentation & Deployment

### Step 21: Update User Documentation

Create or update help documentation explaining:
- What point levels are
- How to upgrade points
- Strategic considerations for leveling
- What happens when points are captured

### Step 22: Create Migration Rollback Plan

Document rollback procedure:

```sql
-- Rollback migration
ALTER TABLE points DROP COLUMN IF EXISTS level;
ALTER TABLE game DROP COLUMN IF EXISTS max_point_level;
ALTER TABLE game DROP COLUMN IF EXISTS health_per_point_level;
ALTER TABLE game DROP COLUMN IF EXISTS upgrade_point_ap_cost;

-- Drop functions
DROP FUNCTION IF EXISTS upgrade_point;
DROP FUNCTION IF EXISTS can_upgrade_point;
DROP FUNCTION IF EXISTS calculate_max_health_for_level;
-- etc...
```

### Step 23: Deploy in Stages

1. **Stage 1:** Database migrations
   - Apply schema changes
   - Deploy functions
   - Test in staging environment

2. **Stage 2:** Backend API
   - Deploy RPC functions
   - Test API endpoints

3. **Stage 3:** Client updates
   - Deploy UI changes
   - Monitor for issues
   - Gather user feedback

---

## Implementation Notes

### Critical Considerations

- **Action Mechanism Architecture:** Upgrades MUST follow the same pattern as all other actions (attack, claim, repair)
  - Users insert rows into the `actions` table with `task_type = 'upgrade'`
  - The `perform_action` trigger handles ALL logic: validation, AP deduction, and upgrade execution
  - Never expose direct RPC functions for upgrades - maintain consistency with existing action system
  - This ensures all game actions go through the same auditable pipeline
- **Order matters:** Follow phases sequentially to avoid broken states
- **Feature flags:** Consider adding a feature flag in game config to enable/disable the system
- **Data migration:** Ensure all existing points have valid level values before deploying client changes
- **Performance:** Add index on `level` column if queries frequently filter by it:
  ```sql
  CREATE INDEX idx_points_level ON points(level);
  ```
- **Real-time updates:** Ensure Supabase real-time subscriptions include the new `level` field
- **Backwards compatibility:** Ensure old clients can still function if they don't understand levels

### Troubleshooting

**Issue:** Points show incorrect max health after upgrade
- **Solution:** Verify `calculate_max_health_for_level()` function is working correctly
- Run: `SELECT id, level, max_health, calculate_max_health_for_level(level) as expected FROM points;`

**Issue:** Upgrade button doesn't enable when it should
- **Solution:** Check all conditions in `canUpgrade` reactive statement
- Verify user faction matches point owner
- Check AP balance

**Issue:** Upgrade action fails silently or with generic error
- **Solution:** Check that `perform_action` trigger is properly handling the 'upgrade' task_type
- Verify the trigger is calling `upgrade_point()` function correctly
- Check database logs for trigger errors

**Issue:** Real-time updates not showing level changes
- **Solution:** Verify Supabase subscription includes `level` field
- Check that client types are regenerated
- Ensure actions table insertions complete successfully (not rolled back by trigger errors)

### Future Enhancements

Potential additions to consider:
- Experience/rewards for upgrading points
- Level-based defensive bonuses (e.g., requires more attackers)
- Visual effects for high-level points
- Leaderboards for highest level points
- Achievements for upgrading points

---

## Checklist

Use this checklist to track implementation progress:

- [ ] Phase 1: Database Schema (Steps 1-3)
  - [ ] Add config columns to game table
  - [ ] Add level column to points table
  - [ ] Initialize existing points
- [ ] Phase 2: Database Functions (Steps 4-6)
  - [ ] Create helper functions
  - [ ] Create upgrade function
  - [ ] Update capture/claim logic
- [ ] Phase 3: Backend API (Steps 7-9)
  - [ ] Expose RPC functions
  - [ ] Update queries
  - [ ] Regenerate TypeScript types
- [ ] Phase 4: Point Display UI (Steps 10-11)
  - [ ] Add level badges to map
  - [ ] Update point info panels
- [ ] Phase 5: Upgrade Action UI (Steps 12-14)
  - [ ] Create upgrade button component
  - [ ] Implement upgrade handler
  - [ ] Update AP displays
- [ ] Phase 6: Level 0 UI (Step 15)
  - [ ] Update claim flow for level 0 points
- [ ] Phase 7: Admin Interface (Steps 16-17)
  - [ ] Add level management
  - [ ] Add configuration controls
- [ ] Phase 8: Testing (Steps 18-20)
  - [ ] Backend tests
  - [ ] Client tests
  - [ ] Integration tests
- [ ] Phase 9: Documentation & Deploy (Steps 21-23)
  - [ ] Update user docs
  - [ ] Create rollback plan
  - [ ] Deploy in stages

---

**End of Implementation Guide**
