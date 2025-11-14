# Point Level System - Testing Guide

**Version:** 1.0
**Date:** 2025-11-14
**Status:** Ready for Testing

## Overview

This guide provides comprehensive testing procedures for the Point Level System feature. Follow these tests in order to ensure all functionality works correctly.

---

## Prerequisites

Before testing, ensure:
- [ ] Both migrations have been applied (`supabase migration up`)
- [ ] TypeScript types have been regenerated (`bash update_db_types.sh`)
- [ ] Local Supabase instance is running
- [ ] Game client is running (`cd game-client && npm run dev`)
- [ ] At least two user accounts exist in different factions
- [ ] At least 3-4 test points exist in the database

---

## Test Environment Setup

### Create Test Data

```sql
-- Verify game configuration
SELECT 
  max_point_level,
  health_per_point_level,
  upgrade_point_ap_cost
FROM game WHERE id = 1;

-- Should return: 3, 255, 50

-- Create/verify test points
SELECT 
  id,
  name,
  level,
  health,
  max_health,
  acquired_by,
  type
FROM point
WHERE type = 'claimable'
ORDER BY level, name;

-- Give test users sufficient AP
UPDATE user_game_data 
SET action_points = 500 
WHERE user_id IN (
  SELECT id FROM "user" WHERE name LIKE 'test%'
);
```

---

## Phase 1: Database Function Tests

### Test 1.1: Helper Functions

**Objective:** Verify helper functions return correct values

```sql
-- Test: Get max point level
SELECT get_max_point_level();
-- Expected: 3

-- Test: Get health per level
SELECT get_health_per_point_level();
-- Expected: 255

-- Test: Get upgrade cost
SELECT get_upgrade_point_ap_cost();
-- Expected: 50

-- Test: Calculate max health for levels
SELECT calculate_max_health_for_level(0);
-- Expected: 0
SELECT calculate_max_health_for_level(1);
-- Expected: 255
SELECT calculate_max_health_for_level(2);
-- Expected: 510
SELECT calculate_max_health_for_level(3);
-- Expected: 765
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 1.2: Can Upgrade Point Function

**Objective:** Verify upgrade eligibility validation

**Setup:**
```sql
-- Get a test user and their faction
SELECT u.id as user_id, u.name, ugd.faction_id
FROM "user" u
JOIN user_game_data ugd ON u.id = ugd.user_id
WHERE u.name = 'test_user_1';
```

**Test Cases:**

```sql
-- Test Case 1: Point owned by user's faction, full health, level < max
-- Should return TRUE
SELECT can_upgrade_point(
  '<point_id_owned_by_faction>',
  '<test_user_id>'
);

-- Test Case 2: Point not at full health
-- Should return FALSE
UPDATE point SET health = 200 WHERE id = '<point_id>';
SELECT can_upgrade_point('<point_id>', '<test_user_id>');
-- Restore health
UPDATE point SET health = max_health WHERE id = '<point_id>';

-- Test Case 3: Point at max level
-- Should return FALSE
UPDATE point SET level = 3 WHERE id = '<point_id>';
SELECT can_upgrade_point('<point_id>', '<test_user_id>');
-- Restore level
UPDATE point SET level = 1 WHERE id = '<point_id>';

-- Test Case 4: Point owned by different faction
-- Should return FALSE
SELECT can_upgrade_point(
  '<point_id_owned_by_other_faction>',
  '<test_user_id>'
);

-- Test Case 5: Non-claimable point
-- Should return FALSE
SELECT can_upgrade_point(
  '<non_claimable_point_id>',
  '<test_user_id>'
);
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 1.3: Upgrade Point Function

**Objective:** Test the upgrade function directly

**Setup:**
```sql
-- Create test scenario: Level 1 point at full health
UPDATE point 
SET level = 1, 
    max_health = 255, 
    health = 255,
    acquired_by = (SELECT faction_id FROM user_game_data WHERE user_id = '<test_user_id>')
WHERE id = '<test_point_id>';

-- Ensure user has enough AP
UPDATE user_game_data 
SET action_points = 500 
WHERE user_id = '<test_user_id>';
```

**Test:**
```sql
-- Attempt upgrade
SELECT upgrade_point('<test_point_id>', '<test_user_id>');
-- Expected: {"success": true, "new_level": 2, "new_max_health": 510, "ap_spent": 50}

-- Verify changes
SELECT level, max_health, health FROM point WHERE id = '<test_point_id>';
-- Expected: level=2, max_health=510, health=510

SELECT action_points FROM user_game_data WHERE user_id = '<test_user_id>';
-- Expected: 450 (500 - 50)
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

## Phase 2: Action System Integration Tests

### Test 2.1: Upgrade Action via Actions Table

**Objective:** Test upgrade through the action insertion system

**Setup:**
```sql
-- Reset point to level 1, full health
UPDATE point 
SET level = 1, max_health = 255, health = 255
WHERE id = '<test_point_id>';

-- Reset user AP
UPDATE user_game_data 
SET action_points = 500 
WHERE user_id = '<test_user_id>';
```

**Test:**
```sql
-- Insert upgrade action
INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
VALUES ('<test_user_id>', '<test_point_id>', 'upgrade', 10, 10);
-- Should succeed and trigger perform_action

-- Verify upgrade occurred
SELECT level, max_health, health FROM point WHERE id = '<test_point_id>';
-- Expected: level=2, max_health=510, health=510

-- Verify AP deduction
SELECT action_points FROM user_game_data WHERE user_id = '<test_user_id>';
-- Expected: 450
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 2.2: Upgrade Action Error Handling

**Objective:** Verify proper error messages for invalid upgrades

**Test Case 1: Insufficient AP**
```sql
-- Set user AP to less than upgrade cost
UPDATE user_game_data SET action_points = 30 WHERE user_id = '<test_user_id>';

-- Attempt upgrade
INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
VALUES ('<test_user_id>', '<test_point_id>', 'upgrade', 10, 10);
-- Expected: ERROR with message about insufficient AP
```

**Test Case 2: Point Not at Full Health**
```sql
-- Reset AP
UPDATE user_game_data SET action_points = 500 WHERE user_id = '<test_user_id>';

-- Damage point
UPDATE point SET health = 200 WHERE id = '<test_point_id>';

-- Attempt upgrade
INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
VALUES ('<test_user_id>', '<test_point_id>', 'upgrade', 10, 10);
-- Expected: ERROR about point not being upgradeable
```

**Test Case 3: Point at Max Level**
```sql
-- Restore health, set to max level
UPDATE point SET health = 765, max_health = 765, level = 3 WHERE id = '<test_point_id>';

-- Attempt upgrade
INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
VALUES ('<test_user_id>', '<test_point_id>', 'upgrade', 10, 10);
-- Expected: ERROR about point being at max level
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 2.3: Level 0 Claim Behavior

**Objective:** Test claiming unclaimed (level 0) points

**Setup:**
```sql
-- Create level 0 point
UPDATE point 
SET level = 0, 
    max_health = 0, 
    health = 0, 
    acquired_by = NULL
WHERE id = '<test_point_id>';

-- Ensure user has AP
UPDATE user_game_data SET action_points = 500 WHERE user_id = '<test_user_id>';
```

**Test:**
```sql
-- Claim the point
INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
VALUES ('<test_user_id>', '<test_point_id>', 'claim', 10, 10);

-- Verify claim results
SELECT level, max_health, health, acquired_by FROM point WHERE id = '<test_point_id>';
-- Expected: 
--   level = 1
--   max_health = 255
--   health = 127 or 128 (half of 255)
--   acquired_by = user's faction_id
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 2.4: Point Capture Reset

**Objective:** Test that captured points reset to level 1

**Setup:**
```sql
-- Set point to level 3, full health, owned by faction A
UPDATE point 
SET level = 3, 
    max_health = 765, 
    health = 765, 
    acquired_by = '<faction_a_id>'
WHERE id = '<test_point_id>';

-- Give faction B user plenty of AP
UPDATE user_game_data 
SET action_points = 1000 
WHERE user_id = '<faction_b_user_id>';
```

**Test:**
```sql
-- Attack point until health reaches 0
-- (May need multiple attack actions)
INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
VALUES ('<faction_b_user_id>', '<test_point_id>', 'attack_and_claim', 100, 10);
-- Repeat as needed...

-- Check point after capture
SELECT level, max_health, health, acquired_by FROM point WHERE id = '<test_point_id>';
-- Expected:
--   level = 1
--   max_health = 255
--   health = 127 or 128 (half of 255)
--   acquired_by = faction_b_id
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

## Phase 3: Client UI Tests

### Test 3.1: Point Stats Display

**Objective:** Verify level display in point stats component

**Steps:**
1. Navigate to a claimable point
2. Observe the point stats card

**Verification:**
- [ ] Level badge displays correctly (e.g., "Level 2")
- [ ] Badge uses appropriate styling (badge-primary)
- [ ] For level 0 points, shows "Unclaimed (Level 0)" in warning color
- [ ] Health bar shows correct max health for level
- [ ] Health text shows current/max health accurately
- [ ] If max_health doesn't match calculated value, warning appears

**Status:** ⬜ Pass / ⬜ Fail

**Screenshot:** _Optional_

**Notes:**
```
_________________________
```

---

### Test 3.2: Upgrade Info Component

**Objective:** Test upgrade information display

**Steps:**
1. Navigate to a point owned by your faction
2. Observe the upgrade info card (below point stats)

**Verification for Upgradeable Point:**
- [ ] Component displays current level
- [ ] Shows next level information
- [ ] Displays next max health value
- [ ] Shows upgrade cost in AP
- [ ] Requirements checklist shows:
  - [ ] Full health checkbox (checked if at full health)
  - [ ] Below max level checkbox (checked if below max)
  - [ ] Faction ownership checkbox (checked)
- [ ] Status message is green/success when upgradeable
- [ ] Message says "Ready to upgrade!"

**Verification for Non-Upgradeable Point:**
- [ ] Appropriate message displays:
  - "Point must be at full health to upgrade" (if damaged)
  - "This point is at maximum level" (if at max)
- [ ] Status alert is warning/info color (not success)
- [ ] Checkboxes reflect actual status

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 3.3: Upgrade Button Availability

**Objective:** Test upgrade button appears when conditions are met

**Test Case 1: Point Owned, Full Health, Below Max Level**
**Steps:**
1. Navigate to a point you own at full health and below max level
2. Look at task overview section

**Verification:**
- [ ] "Upgrade Point" button is visible
- [ ] Button shows AP cost (e.g., "50 AP")
- [ ] Button is enabled (not grayed out)
- [ ] Repair button also visible
- [ ] Attack buttons NOT visible

**Test Case 2: Point Owned but Damaged**
**Steps:**
1. Navigate to a point you own but health < max_health

**Verification:**
- [ ] "Upgrade Point" button is NOT visible
- [ ] Only "Repair" button visible

**Test Case 3: Point at Max Level**
**Steps:**
1. Navigate to a level 3 point you own

**Verification:**
- [ ] "Upgrade Point" button is NOT visible
- [ ] Only "Repair" button visible

**Test Case 4: Enemy Point**
**Steps:**
1. Navigate to a point owned by another faction

**Verification:**
- [ ] "Upgrade Point" button is NOT visible
- [ ] "Attack" and "Attack and Claim" buttons visible

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 3.4: Performing Upgrade Action

**Objective:** Test the complete upgrade flow through the UI

**Setup:**
- Ensure you have at least 50 AP
- Navigate to an upgradeable point (full health, level < 3, owned)

**Steps:**
1. Note current level, max health, and AP
2. Click "Upgrade Point" button
3. Wait for action to complete

**Verification:**
- [ ] Loading spinner appears during action
- [ ] No error message displays
- [ ] Point level increases by 1
- [ ] Point max health increases by 255
- [ ] Point health equals new max health
- [ ] Your AP decreases by 50 (or configured cost)
- [ ] Level badge updates immediately
- [ ] Health bar updates to new max
- [ ] If now at max level, upgrade button disappears
- [ ] Success feedback (if implemented)

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 3.5: Upgrade Error Handling

**Objective:** Test error messages display correctly

**Test Case 1: Insufficient AP**
**Setup:** Use or reduce AP to less than 50

**Steps:**
1. Navigate to upgradeable point
2. Attempt to click upgrade button

**Verification:**
- [ ] Button is disabled (grayed out)
- [ ] Cannot click button
- [ ] Error message may appear about insufficient AP

**Test Case 2: Point Takes Damage During Navigation**
**Setup:** Have point damaged after you view it

**Steps:**
1. View an upgradeable point
2. Have another user damage the point
3. Try to upgrade

**Verification:**
- [ ] Error message displays
- [ ] Action fails gracefully
- [ ] UI updates to reflect point is no longer upgradeable

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 3.6: Level 0 Point Display

**Objective:** Test unclaimed point UI

**Steps:**
1. Navigate to an unclaimed (level 0) point

**Verification:**
- [ ] Shows "Unclaimed (Level 0)" in warning/highlighted color
- [ ] No level badge displayed (or shows "Level 0")
- [ ] Health bar shows 0/0 or is hidden
- [ ] "Claim" button is available
- [ ] No upgrade info component visible
- [ ] Upgrade button NOT visible

**After Claiming:**
- [ ] Point changes to Level 1
- [ ] Health becomes 127-128 (half of 255)
- [ ] Max health becomes 255
- [ ] Level badge now shows "Level 1"
- [ ] Point assigned to your faction

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

## Phase 4: Integration Tests

### Test 4.1: Full Upgrade Path (Level 1 → 3)

**Objective:** Test upgrading a point through all levels

**Setup:**
- Point at level 1, full health, owned by your faction
- Ensure you have at least 150 AP (3 × 50)

**Steps:**
1. Upgrade point from level 1 to level 2
2. Upgrade point from level 2 to level 3
3. Attempt to upgrade from level 3 (should fail)

**Verification:**

**After Level 1 → 2:**
- [ ] Level = 2
- [ ] Max Health = 510
- [ ] Health = 510
- [ ] AP reduced by 50

**After Level 2 → 3:**
- [ ] Level = 3
- [ ] Max Health = 765
- [ ] Health = 765
- [ ] AP reduced by 50 (total 100 spent)
- [ ] Upgrade button disappears
- [ ] Upgrade info shows "at maximum level"

**Attempting Level 3 → 4:**
- [ ] Upgrade button not visible
- [ ] Cannot attempt upgrade

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 4.2: Upgrade → Damage → Repair → Upgrade

**Objective:** Test complete gameplay loop with upgrades

**Steps:**
1. Upgrade point to level 2
2. Have enemy damage the point
3. Repair point back to full health
4. Upgrade point to level 3

**Verification:**
- [ ] After upgrade to level 2: health = 510/510
- [ ] After damage: health < 510
- [ ] Upgrade button disappears when damaged
- [ ] Repair button available
- [ ] After repair: health = 510/510
- [ ] Upgrade button reappears
- [ ] Can upgrade to level 3
- [ ] Final state: level 3, health 765/765

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 4.3: Capture and Reset

**Objective:** Test level reset on capture

**Setup:**
- Upgrade point to level 3 (765 HP)
- Have it owned by faction A

**Steps:**
1. As faction B user, attack the level 3 point
2. Reduce health to 0 and capture it

**Verification:**
- [ ] During attacks, level remains 3
- [ ] Max health remains 765
- [ ] After capture (health ≤ 0):
  - [ ] Level resets to 1
  - [ ] Max health becomes 255
  - [ ] Health becomes ~127-128 (half)
  - [ ] Ownership transfers to faction B
- [ ] Captured point can be upgraded again by faction B
- [ ] Faction A cannot upgrade it anymore

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 4.4: Multi-User Scenario

**Objective:** Test level system with multiple users

**Scenario:**
- User A (Faction Red) owns a level 1 point
- User B (Faction Blue) is at a different point
- User C (Faction Red) is at the same point as User A

**Tests:**
1. User A upgrades point to level 2
   - [ ] User C sees the upgrade immediately (realtime update)
   - [ ] User B can see updated level when visiting

2. User C repairs the point
   - [ ] Health bar updates for User A
   - [ ] Both see same health value

3. User B captures the point
   - [ ] Point resets to level 1 for everyone
   - [ ] User A and C can no longer upgrade it
   - [ ] User B can now upgrade it

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

## Phase 5: Performance Tests

### Test 5.1: Large Number of Actions

**Objective:** Test system performance with many actions

**Test:**
```sql
-- Create 100 actions rapidly
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..100 LOOP
    -- Alternate between attack and repair
    IF i % 2 = 0 THEN
      INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
      VALUES ('<test_user_id>', '<test_point_id>', 'attack', 10, 10);
    ELSE
      INSERT INTO actions (created_by, point, type, strength, rewarded_experience)
      VALUES ('<test_user_id>', '<test_point_id>', 'repair', 10, 10);
    END IF;
  END LOOP;
END $$;
```

**Verification:**
- [ ] All actions process successfully
- [ ] No database errors
- [ ] perform_action trigger handles all actions
- [ ] Final point state is consistent
- [ ] Response time is acceptable (< 5s for all)

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

## Phase 6: Edge Cases

### Test 6.1: Concurrent Upgrades

**Objective:** Test two users trying to upgrade same point simultaneously

**Setup:** Requires two browser sessions

**Test:**
1. Both users navigate to same upgradeable point
2. Both click upgrade at approximately the same time

**Expected Behavior:**
- [ ] Only one upgrade succeeds
- [ ] Other gets appropriate error message
- [ ] No data corruption
- [ ] Point is only upgraded once

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

### Test 6.2: Configuration Changes

**Objective:** Test changing game configuration values

**Test:**
```sql
-- Change max level to 4
UPDATE game SET max_point_level = 4 WHERE id = 1;

-- Change health per level to 300
UPDATE game SET health_per_point_level = 300 WHERE id = 1;

-- Change upgrade cost to 75
UPDATE game SET upgrade_point_ap_cost = 75 WHERE id = 1;
```

**Verification:**
- [ ] UI reflects new max level (can upgrade to 4)
- [ ] New upgrades use 300 HP per level
- [ ] Upgrade button shows 75 AP cost
- [ ] Existing points maintain their health
- [ ] New calculations use new values
- [ ] Helper functions return updated values

**Cleanup:**
```sql
-- Restore defaults
UPDATE game SET max_point_level = 3, health_per_point_level = 255, upgrade_point_ap_cost = 50 WHERE id = 1;
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
_________________________
```

---

## Test Results Summary

### Overall Statistics

- Total Tests: 21
- Passed: _____
- Failed: _____
- Skipped: _____
- Pass Rate: _____%

### Critical Issues Found

1. Issue: _______________________
   - Severity: High / Medium / Low
   - Steps to Reproduce: _______________________
   - Expected: _______________________
   - Actual: _______________________

2. Issue: _______________________
   - Severity: High / Medium / Low
   - Steps to Reproduce: _______________________
   - Expected: _______________________
   - Actual: _______________________

### Non-Critical Issues Found

1. _______________________
2. _______________________
3. _______________________

### Performance Notes

- Average action processing time: _____ms
- UI responsiveness: Excellent / Good / Fair / Poor
- Database query performance: Excellent / Good / Fair / Poor

---

## Sign-Off

**Tester Name:** _______________________
**Date:** _______________________
**Status:** ⬜ Approved for Deployment / ⬜ Requires Fixes

**Additional Comments:**
```
_________________________
_________________________
_________________________
```

---

## Appendix: Useful SQL Queries for Testing

### Reset Point to Specific State
```sql
-- Reset to level 1, full health
UPDATE point 
SET level = 1, max_health = 255, health = 255
WHERE id = '<point_id>';

-- Reset to level 0 (unclaimed)
UPDATE point 
SET level = 0, max_health = 0, health = 0, acquired_by = NULL
WHERE id = '<point_id>';

-- Set to max level
UPDATE point 
SET level = 3, max_health = 765, health = 765
WHERE id = '<point_id>';
```

### Grant AP to User
```sql
UPDATE user_game_data 
SET action_points = 500 
WHERE user_id = '<user_id>';
```

### View All Point States
```sql
SELECT 
  p.name,
  p.level,
  p.health,
  p.max_health,
  f.name as faction,
  p.type
FROM point p
LEFT JOIN faction f ON p.acquired_by = f.id
WHERE p.type = 'claimable'
ORDER BY p.level DESC, p.name;
```

### View Recent Actions
```sql
SELECT 
  a.created_at,
  u.name as user,
  p.name as point,
  a.type,
  a.strength
FROM actions a
JOIN "user" u ON a.created_by = u.id
JOIN point p ON a.point = p.id
ORDER BY a.created_at DESC
LIMIT 20;
```

### Check User AP and Stats
```sql
SELECT 
  u.name,
  ugd.action_points,
  ugd.experience,
  f.name as faction
FROM "user" u
JOIN user_game_data ugd ON u.id = ugd.user_id
JOIN faction f ON ugd.faction_id = f.id
WHERE u.name LIKE 'test%';
```
