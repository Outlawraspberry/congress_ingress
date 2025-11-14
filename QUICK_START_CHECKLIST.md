# Point Level System - Quick Start Checklist

**Date:** 2025-11-14
**Status:** Ready for Testing & Deployment

---

## Pre-Deployment Checklist

### ✅ Code Implementation Complete

- [x] Database schema migrations created
- [x] Database functions implemented
- [x] Edge function updated
- [x] TypeScript types regenerated
- [x] Client UI components updated
- [x] Documentation created

---

## Deployment Steps

### Step 1: Apply Database Migrations

```bash
cd /home/benjamin/projects/outlawraspberry/congress-ingress/supabase
supabase migration up
```

**Verify:**
```sql
-- Check for level column
\d point

-- Check for new game columns
\d game

-- Test helper functions
SELECT get_max_point_level();
SELECT calculate_max_health_for_level(1);
SELECT calculate_max_health_for_level(2);
SELECT calculate_max_health_for_level(3);
```

- [ ] Migrations applied successfully
- [ ] No errors in migration output
- [ ] Level column exists on point table
- [ ] Game table has new configuration columns
- [ ] Helper functions work correctly

---

### Step 2: Verify Type Regeneration

```bash
cd /home/benjamin/projects/outlawraspberry/congress-ingress
bash update_db_types.sh
```

**Verify in `types/database.types.ts`:**
```bash
# Check for level in point type
grep -A 10 "point: {" types/database.types.ts | grep level

# Check for upgrade in task_type
grep "task_type" types/database.types.ts | grep upgrade
```

- [ ] Types regenerated successfully
- [ ] Point interface includes level field
- [ ] Game interface includes new config fields
- [ ] task_type enum includes 'upgrade'

---

### Step 3: Restart Development Server

```bash
cd game-client
npm run dev
```

- [ ] Server starts without errors
- [ ] No TypeScript compilation errors
- [ ] No console errors on page load

---

## Quick Smoke Tests

### Test 1: View a Point with Level

1. Navigate to any claimable point
2. Look at the point stats

**Expected:**
- [ ] Level badge displays (e.g., "Level 1" or "Level 0")
- [ ] Health bar shows correctly
- [ ] No console errors

---

### Test 2: View Owned Point

1. Navigate to a point owned by your faction

**Expected:**
- [ ] Upgrade info component appears below point stats
- [ ] Shows current level and upgrade requirements
- [ ] No errors in browser console

---

### Test 3: Check for Upgrade Button

1. Navigate to a point you own at full health and level < 3

**Expected:**
- [ ] Repair button visible
- [ ] Upgrade button visible (if at full health)
- [ ] Button shows AP cost
- [ ] No console errors

---

### Test 4: Perform an Upgrade

**Prerequisites:**
- Point must be at full health
- Point must be owned by your faction
- Point must be level 1 or 2
- You must have at least 50 AP

**Steps:**
1. Click "Upgrade Point" button
2. Wait for action to complete

**Expected:**
- [ ] Loading spinner appears
- [ ] No error messages
- [ ] Level increases by 1
- [ ] Max health increases by 255
- [ ] Health = new max health
- [ ] AP decreased by 50
- [ ] UI updates immediately

---

### Test 5: Claim a Level 0 Point

1. Navigate to an unclaimed point
2. Click "Claim" button

**Expected:**
- [ ] Shows "Unclaimed (Level 0)" before claim
- [ ] Point becomes Level 1 after claim
- [ ] Health becomes ~127-128 (half of 255)
- [ ] Point assigned to your faction

---

## Database Verification Queries

```sql
-- View all points with levels
SELECT 
  name,
  level,
  health,
  max_health,
  type,
  acquired_by IS NOT NULL as claimed
FROM point
WHERE type = 'claimable'
ORDER BY level DESC, name;

-- View game configuration
SELECT 
  max_point_level,
  health_per_point_level,
  upgrade_point_ap_cost,
  attack_ap_cost,
  claim_ap_cost,
  repair_ap_cost
FROM game;

-- Check recent actions including upgrades
SELECT 
  type,
  COUNT(*) as count
FROM actions
GROUP BY type
ORDER BY count DESC;

-- View upgrade actions
SELECT 
  a.created_at,
  u.name as user,
  p.name as point,
  a.type
FROM actions a
JOIN "user" u ON a.created_by = u.id
JOIN point p ON a.point = p.id
WHERE a.type = 'upgrade'
ORDER BY a.created_at DESC
LIMIT 10;
```

---

## Known Issues & Workarounds

### Issue: Types not updating

**Workaround:**
```bash
# Stop dev server
# Regenerate types
bash update_db_types.sh
# Clear cache and restart
rm -rf game-client/.svelte-kit
cd game-client && npm run dev
```

### Issue: Upgrade button not appearing

**Check:**
- Point is at full health (health === max_health)
- Point is owned by your faction
- Point level < max_point_level (default 3)
- No browser console errors

### Issue: Migration fails

**Check:**
- Previous migrations are applied
- Database connection is active
- Supabase is running (`supabase status`)

---

## Configuration Tuning (Optional)

After initial testing, you may want to adjust values:

```sql
-- Increase max level to 4
UPDATE game SET max_point_level = 4 WHERE id = 1;

-- Increase health per level
UPDATE game SET health_per_point_level = 300 WHERE id = 1;

-- Adjust upgrade cost
UPDATE game SET upgrade_point_ap_cost = 75 WHERE id = 1;

-- Give users more AP for testing
UPDATE user_game_data SET action_points = 500;
```

---

## Quick Testing Data Setup

```sql
-- Create a test scenario: one point at each level

-- Level 0 point (unclaimed)
UPDATE point 
SET level = 0, max_health = 0, health = 0, acquired_by = NULL
WHERE name = 'Test Point Alpha' AND type = 'claimable';

-- Level 1 point
UPDATE point 
SET level = 1, max_health = 255, health = 255, 
    acquired_by = (SELECT faction_id FROM user_game_data LIMIT 1)
WHERE name = 'Test Point Beta' AND type = 'claimable';

-- Level 2 point at full health (can upgrade)
UPDATE point 
SET level = 2, max_health = 510, health = 510, 
    acquired_by = (SELECT faction_id FROM user_game_data LIMIT 1)
WHERE name = 'Test Point Gamma' AND type = 'claimable';

-- Level 2 point damaged (cannot upgrade)
UPDATE point 
SET level = 2, max_health = 510, health = 300, 
    acquired_by = (SELECT faction_id FROM user_game_data LIMIT 1)
WHERE name = 'Test Point Delta' AND type = 'claimable';

-- Level 3 point (max level, cannot upgrade)
UPDATE point 
SET level = 3, max_health = 765, health = 765, 
    acquired_by = (SELECT faction_id FROM user_game_data LIMIT 1)
WHERE name = 'Test Point Epsilon' AND type = 'claimable';

-- Give test users plenty of AP
UPDATE user_game_data SET action_points = 500;
```

---

## Success Criteria

Before considering deployment complete:

### Backend
- [ ] All migrations applied without errors
- [ ] Helper functions return correct values
- [ ] Can upgrade point via SQL insert into actions
- [ ] Level 0 claim sets point to level 1 at half health
- [ ] Point capture resets to level 1 at half health

### Frontend
- [ ] Level badges display correctly
- [ ] Upgrade info component shows when point owned
- [ ] Upgrade button appears when conditions met
- [ ] Upgrade action completes successfully
- [ ] UI updates after upgrade
- [ ] No console errors

### Integration
- [ ] Full upgrade path works (1 → 2 → 3)
- [ ] Cannot upgrade past max level
- [ ] Cannot upgrade without full health
- [ ] Cannot upgrade enemy points
- [ ] AP deducted correctly

---

## Rollback Procedure (If Needed)

If critical issues are found:

```sql
-- Disable upgrades temporarily
ALTER TABLE actions ADD CONSTRAINT temp_no_upgrades 
  CHECK (type != 'upgrade');

-- Or remove upgrade from actions
DELETE FROM actions WHERE type = 'upgrade';
```

Then redeploy previous client version without upgrade UI.

---

## Next Steps After Testing

1. **Complete Full Test Suite**
   - See `TESTING_GUIDE.md` for comprehensive tests
   - Document any issues found

2. **User Documentation**
   - Create player-facing guide
   - Explain upgrade mechanics
   - Show AP costs and benefits

3. **Admin Tools**
   - Build admin interface for level management
   - Add analytics for level distribution

4. **Production Deployment**
   - Deploy migrations to production
   - Deploy client updates
   - Monitor for issues

5. **Balance Tuning**
   - Monitor upgrade frequency
   - Adjust costs if needed
   - Collect player feedback

---

## Support

For issues or questions:

- Check `IMPLEMENTATION_SUMMARY.md` for overview
- See `TESTING_GUIDE.md` for detailed test procedures
- Review `NEXT_STEPS.md` for additional guidance
- Check `point_level_system_progress.md` for implementation details

---

## Status Sign-Off

**Deployment Date:** _______________
**Deployed By:** _______________

**Smoke Tests:** ⬜ Pass / ⬜ Fail
**Database Tests:** ⬜ Pass / ⬜ Fail
**UI Tests:** ⬜ Pass / ⬜ Fail

**Ready for Production:** ⬜ Yes / ⬜ No

**Notes:**
```
_____________________________________
_____________________________________
_____________________________________
```
