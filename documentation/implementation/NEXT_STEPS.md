# Point Level System - Next Steps

**Current Status:** Database migrations created, ready to apply
**Date:** 2025-11-14

## What Has Been Completed ✅

### Phase 1 & 2: Database Schema and Functions
Two migration files have been created but **NOT YET APPLIED**:

1. **`20251114085044_add_point_level_system_phase1.sql`**
   - Adds `level` column to `point` table
   - Adds configuration columns to `game` table (max_point_level, health_per_point_level, upgrade_point_ap_cost)
   - Updates existing points with appropriate levels

2. **`20251114085045_add_point_level_system_phase2.sql`**
   - Creates helper functions for level calculations
   - Creates `upgrade_point()` function for upgrading points
   - Adds 'upgrade' to `task_type` enum
   - Updates `perform_action()` trigger to handle upgrades
   - Updates claim logic for level 0 points
   - Updates capture logic to reset points to level 1

### Documentation
- Created `point_level_system_progress.md` tracking implementation status

---

## Immediate Next Steps

### Step 1: Apply Database Migrations 🔴 REQUIRED

The migrations must be applied to the local Supabase instance:

```bash
cd supabase
supabase migration up
```

**Expected Result:**
- `point` table will have a `level` column
- `game` table will have new configuration columns
- New database functions will be available
- `task_type` enum will include 'upgrade'
- `perform_action()` trigger will handle upgrade logic

**Verification:**
```sql
-- Check point table has level column
SELECT level, COUNT(*) FROM point GROUP BY level;

-- Check game table has new columns
SELECT max_point_level, health_per_point_level, upgrade_point_ap_cost FROM game;

-- Check task_type enum includes upgrade
SELECT unnest(enum_range(NULL::task_type));

-- Test helper functions
SELECT get_max_point_level();
SELECT calculate_max_health_for_level(1);
SELECT calculate_max_health_for_level(2);
SELECT calculate_max_health_for_level(3);
```

### Step 2: Regenerate TypeScript Types 🟡 REQUIRED

After applying migrations, update the TypeScript types:

```bash
cd /home/benjamin/projects/outlawraspberry/congress-ingress
bash update_db_types.sh
```

**Expected Changes in `types/database.types.ts`:**
- `point.Row` will include `level: number`
- `game.Row` will include:
  - `max_point_level: number`
  - `health_per_point_level: number`
  - `upgrade_point_ap_cost: number`
- `task_type` enum will include `"upgrade"`

**Verification:**
```bash
# Check for level field in point type
grep -A 5 "point: {" types/database.types.ts | grep level

# Check for upgrade in task_type enum
grep "task_type" types/database.types.ts
```

### Step 3: Update Edge Function Type Validation 🟡 REQUIRED

File: `supabase/functions/perform_action/action/action.ts`

Add 'upgrade' to the valid action types:

```typescript
export type ActionType = 'attack' | 'attack_and_claim' | 'repair' | 'claim' | 'upgrade';
```

**Note:** The edge function already handles generic action types by inserting into the `actions` table. The trigger will handle the upgrade logic.

---

## Phase 3: Backend API Implementation

### Step 4: Update Client-Side Action Types 🟡

File: `game-client/src/types/alias.ts`

Check if `TaskType` includes 'upgrade'. If not, update it:

```typescript
export type TaskType = 'attack' | 'attack_and_claim' | 'repair' | 'claim' | 'upgrade';
```

Or if it's imported from database types, it should automatically include 'upgrade' after Step 2.

### Step 5: Update Action Cost Fallbacks 🟡

File: `game-client/src/lib/supabase/actions.ts`

Update the `getActionPointCost()` function fallback defaults:

```typescript
const defaults: Record<TaskType, number> = {
  attack: 10,
  claim: 15,
  repair: 8,
  attack_and_claim: 25,
  upgrade: 50  // ADD THIS LINE
};
```

---

## Phase 4: Client UI - Point Display

### Step 6: Update Point Stats Component 🟠

File: `game-client/src/lib/components/point-stats.svelte`

**Add level display:**

```svelte
<script lang="ts">
  import faction from '$lib/supabase/faction/faction';
  import type { PointState } from '$lib/supabase/game/points.svelte';
  import Card from './card.svelte';

  const { point, class: klazz }: { point: PointState; class?: string } = $props();

  let factionName = $state('Unclaimed');
  let activeUsersAtPoint = $derived(point.state.currentUsers.length);
  
  // NEW: Get level and calculate expected max health
  let pointLevel = $derived(point.state.point?.level ?? 0);
  let healthPerLevel = $derived(255); // TODO: Get from game config
  let calculatedMaxHealth = $derived(pointLevel * healthPerLevel);

  let currentProgressColor = $derived.by(() => {
    if (point.state.point == null) return 'progress-error';

    const health = point.state.point.health;
    const maxHealth = point.state.point.max_health;

    if (health >= maxHealth * 0.9) {
      return 'progress-success';
    } else if (health >= maxHealth * 0.3) {
      return 'progress-warning';
    }

    return 'progress-error';
  });

  $effect(() => {
    if (point.state.point?.acquired_by) {
      faction.getName(point.state.point.acquired_by).then((name) => {
        if (name) factionName = name;
      });
    } else {
      factionName = 'Unclaimed';
    }
  });
</script>

<Card class={`my-5 w-full ${klazz}`}>
  <!-- NEW: Level display -->
  {#if pointLevel > 0}
    <div class="flex justify-between items-center mb-2">
      <p class="text-center text-lg flex-1">Acquired by: <span class="font-bold">{factionName}</span></p>
      <div class="badge badge-primary badge-lg">Level {pointLevel}</div>
    </div>
  {:else}
    <p class="text-center text-lg">
      <span class="font-bold">Unclaimed (Level 0)</span>
    </p>
  {/if}

  {#if activeUsersAtPoint > 1}
    <p class="text-md text-center">There are {activeUsersAtPoint} active users at this point!</p>
  {/if}

  <progress
    value={point.state.point?.health}
    max={point.state.point?.max_health}
    class={`progress my-3 h-5 ${currentProgressColor}`}
  ></progress>
  <p class="text-center">
    {point.state.point?.health} / {point.state.point?.max_health}
    {#if point.state.point?.max_health !== calculatedMaxHealth}
      <small class="text-warning">(Expected: {calculatedMaxHealth})</small>
    {/if}
  </p>
</Card>
```

---

## Phase 5: Client UI - Upgrade Action

### Step 7: Add Upgrade to Task Overview 🟠

File: `game-client/src/lib/components/task/task-overview.svelte`

**Update possible tasks logic:**

```typescript
const possibleTasks: TaskType[] = $derived.by(() => {
  if (!isClaimable) return [];
  
  if (chosenPoint.state.point?.acquired_by == null) {
    return ['claim'];
  }

  if (chosenPoint.state.point?.acquired_by === user.user?.faction) {
    const tasks: TaskType[] = ['repair'];
    
    // NEW: Add upgrade if conditions are met
    const point = chosenPoint.state.point;
    const maxLevel = 3; // TODO: Get from game config
    const canUpgrade = point.health === point.max_health && 
                      point.level < maxLevel;
    
    if (canUpgrade) {
      tasks.push('upgrade');
    }
    
    return tasks;
  }

  if (chosenPoint.state.point?.acquired_by !== user.user?.faction) {
    return ['attack', 'attack_and_claim'];
  }

  return [];
});
```

**Update button display:**

```svelte
<div class="flex justify-center gap-5">
  {#each possibleTasks as task (task)}
    <button
      class="btn btn-primary btn-xl"
      onclick={() => preformAction(task)}
      disabled={!user.user?.canUseAction ||
        isPerformingAction ||
        (user.user && actionCosts[task] != null && user.user.actionPoints < actionCosts[task])}
    >
      {#if isPerformingAction}
        <span class="loading loading-spinner loading-sm"></span>
      {/if}
      <div class="flex flex-col items-center">
        {#if task == 'attack'}
          Attack
        {:else if task === 'attack_and_claim'}
          Attack and Claim
        {:else if task === 'claim'}
          Claim
        {:else if task === 'repair'}
          Repair
        {:else if task === 'upgrade'}
          Upgrade Point
        {/if}
        {#if actionCosts[task]}
          <span class="text-xs opacity-70">({actionCosts[task]} AP)</span>
        {/if}
      </div>
    </button>
  {/each}
</div>
```

---

## Testing Checklist

### Backend Testing (After Step 1)
- [ ] Migrations apply successfully
- [ ] Helper functions work correctly
- [ ] Can upgrade a point at full health (level 1 → 2)
- [ ] Can upgrade again (level 2 → 3)
- [ ] Cannot upgrade past max level
- [ ] Cannot upgrade without full health
- [ ] Cannot upgrade enemy points
- [ ] Claiming level 0 point sets to level 1 with half health
- [ ] Capturing enemy point resets to level 1 with half health
- [ ] AP is correctly deducted for upgrades

### Frontend Testing (After Steps 6-7)
- [ ] Point level displays correctly
- [ ] Upgrade button shows when conditions are met
- [ ] Upgrade button shows correct AP cost
- [ ] Upgrade button disabled when cannot afford
- [ ] Upgrade button disabled when not at full health
- [ ] Upgrade button disabled at max level
- [ ] Upgrade action works end-to-end
- [ ] UI updates after successful upgrade
- [ ] Error messages display correctly

---

## SQL Testing Queries

After applying migrations, test with these queries:

```sql
-- Test helper functions
SELECT get_max_point_level();
SELECT get_health_per_point_level();
SELECT get_upgrade_point_ap_cost();
SELECT calculate_max_health_for_level(1);
SELECT calculate_max_health_for_level(2);
SELECT calculate_max_health_for_level(3);

-- Check point levels
SELECT 
  id, 
  name, 
  level, 
  health, 
  max_health, 
  acquired_by 
FROM point 
WHERE type = 'claimable'
ORDER BY level DESC, name;

-- Find upgradeable points (for a specific faction)
SELECT 
  p.id,
  p.name,
  p.level,
  p.health,
  p.max_health,
  f.name as faction_name
FROM point p
JOIN faction f ON p.acquired_by = f.id
WHERE p.health = p.max_health
  AND p.level < (SELECT max_point_level FROM game LIMIT 1)
  AND p.type = 'claimable';
```

---

## Deployment Plan

### Stage 1: Database (Low Risk)
1. Apply migrations to production database
2. Verify schema changes
3. Test database functions
4. Monitor for errors

**Rollback:** Migrations can be reversed if needed

### Stage 2: Backend (Medium Risk)
1. Deploy updated edge functions
2. Deploy updated type definitions
3. Test action system with new upgrade type
4. Monitor error logs

**Rollback:** Revert edge function deployment

### Stage 3: Frontend (Low Risk)
1. Deploy UI updates
2. Test upgrade functionality in production
3. Monitor user actions and feedback
4. Collect data on upgrade usage

**Rollback:** Revert client deployment (backend still compatible)

---

## Configuration Tuning

After initial deployment, monitor and adjust these values in the `game` table:

```sql
-- Adjust max point level (if needed)
UPDATE game SET max_point_level = 4 WHERE id = 1;

-- Adjust health per level
UPDATE game SET health_per_point_level = 300 WHERE id = 1;

-- Adjust upgrade cost
UPDATE game SET upgrade_point_ap_cost = 75 WHERE id = 1;
```

**Recommended Monitoring:**
- Average time to upgrade from level 1 to 2
- Percentage of points at each level
- AP economy impact
- Capture rate changes
- Player feedback on upgrade costs

---

## Support & Troubleshooting

### Common Issues

**Issue:** Migrations fail to apply
- Check database connection
- Verify previous migrations are applied
- Check for syntax errors in migration files

**Issue:** TypeScript types not updating
- Ensure migrations are applied first
- Check Supabase CLI version
- Manually verify schema changes in database

**Issue:** Upgrade action fails
- Check user has sufficient AP
- Verify point is at full health
- Verify point is owned by user's faction
- Check point level < max level
- Review database function error messages

**Issue:** UI doesn't show upgrade button
- Verify types are regenerated
- Check point state includes level
- Verify logic for showing upgrade button
- Check browser console for errors

---

## Questions & Decisions Needed

1. **Health Scaling:** Current linear scaling (255, 510, 765). Should it be exponential?
2. **Capture Reset:** Should captured points always reset to level 1, or preserve some levels?
3. **Upgrade Cost:** Default 50 AP. Need to test if this is balanced.
4. **Max Level:** Default 3. Is this appropriate for gameplay?
5. **Visual Design:** What should level badges look like? Colors? Icons?

---

## Contact & References

- **Implementation Guide:** `documentation/implementation/point_level_system.md`
- **Progress Tracker:** `documentation/implementation/point_level_system_progress.md`
- **Concept Document:** `documentation/concepts/2025_11_14_point_level.md`

For questions or issues, refer to the documentation or check the database migration comments.