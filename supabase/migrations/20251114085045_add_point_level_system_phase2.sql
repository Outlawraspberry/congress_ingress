-- Phase 2: Database Functions for Point Level System
-- This migration adds helper functions and the upgrade action logic

set check_function_bodies = off;

-- Step 4: Create Helper Functions

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
  SELECT * INTO v_point FROM public.point WHERE id = p_point_id;

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

-- Step 5: Create Upgrade Action Function
-- Note: This function is called by the perform_action trigger when a user inserts
-- an 'upgrade' action into the actions table. Users do not call this function directly.

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
    RAISE EXCEPTION 'Point cannot be upgraded (check ownership, health, and level)';
  END IF;

  -- Get upgrade cost
  v_upgrade_cost := get_upgrade_point_ap_cost();

  -- Get user's current AP
  SELECT action_points INTO v_user_ap
  FROM public.user_game_data
  WHERE user_id = p_user_id;

  -- Check if user has enough AP
  IF v_user_ap < v_upgrade_cost THEN
    RAISE EXCEPTION 'Insufficient action points for upgrade (required: %, has: %)', v_upgrade_cost, v_user_ap;
  END IF;

  -- Get current point data
  SELECT * INTO v_point FROM public.point WHERE id = p_point_id;

  -- Calculate new values
  v_new_level := v_point.level + 1;
  v_new_max_health := calculate_max_health_for_level(v_new_level);

  -- Update point
  UPDATE public.point
  SET level = v_new_level,
      max_health = v_new_max_health
  WHERE id = p_point_id;

  -- Deduct AP (this is now handled in perform_action, but keeping for consistency)
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

-- Step 6: Update task_type Enum and perform_action Function

-- Add upgrade to task_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t
                   JOIN pg_enum e ON t.oid = e.enumtypid
                   WHERE t.typname = 'task_type' AND e.enumlabel = 'upgrade') THEN
        ALTER TYPE public.task_type ADD VALUE 'upgrade';
    END IF;
END$$;

-- Update get_ap_cost_for_action to include upgrade
CREATE OR REPLACE FUNCTION public.get_ap_cost_for_action(a_action_type task_type)
 RETURNS smallint
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (
    CASE a_action_type
      WHEN 'attack' THEN (SELECT attack_ap_cost FROM game WHERE id = 1)
      WHEN 'attack_and_claim' THEN (SELECT attack_ap_cost + claim_ap_cost FROM game WHERE id = 1)
      WHEN 'claim' THEN (SELECT claim_ap_cost FROM game WHERE id = 1)
      WHEN 'repair' THEN (SELECT repair_ap_cost FROM game WHERE id = 1)
      WHEN 'upgrade' THEN (SELECT upgrade_point_ap_cost FROM game WHERE id = 1)
      ELSE 0
    END
  );
END;
$function$;

-- Update perform_action function to handle upgrades and level 0 claims
CREATE OR REPLACE FUNCTION public.perform_action()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_required_ap smallint;
    v_user_ap integer;
    v_point RECORD;
    v_user_faction_id UUID;
BEGIN
    -- Get point data
    SELECT * INTO v_point FROM point WHERE id = new.point;

    -- Get user's faction
    SELECT faction_id INTO v_user_faction_id
    FROM user_game_data
    WHERE user_id = new.created_by;

    -- Only allow actions on claimable points (except for upgrade which has its own checks)
    IF v_point.type != 'claimable' THEN
        RAISE EXCEPTION 'Action not allowed on non-claimable point %', new.point;
    END IF;

    -- Check if user has enough AP for this action
    SELECT get_ap_cost_for_action(new.type) INTO v_required_ap;
    SELECT action_points INTO v_user_ap FROM user_game_data WHERE user_id = new.created_by;

    IF v_user_ap < v_required_ap THEN
        RAISE EXCEPTION 'User % does not have enough AP for action % (required: %, has: %)', new.created_by, new.type, v_required_ap, v_user_ap;
    END IF;

    -- Spend AP for the action
    PERFORM spend_ap_for_action(new.created_by, new.type);

    -- Handle different action types
    IF (new.type = 'upgrade') THEN
        -- Perform upgrade (this will validate ownership, health, etc.)
        PERFORM upgrade_point(new.point, new.created_by);

    ELSIF (new.type = 'attack' OR new.type = 'attack_and_claim') THEN
        UPDATE point
        SET health = (
            (select point.health from point where point.id = new.point) -
            new.strength
        )
        WHERE point.id = new.point;
    END IF;

    -- Handle claim actions
    IF ((new.type = 'attack_and_claim' and (select point.health from point where point.id = new.point) <= 0)) THEN
        -- Captured point: Reset to level 1 with half health
        UPDATE point
        SET level = 1,
            max_health = get_health_per_point_level(),
            health = get_health_per_point_level() / 2,
            acquired_by = v_user_faction_id
        WHERE point.id = new.point;

    ELSIF (new.type = 'claim' and (select point.acquired_by from point where point.id = new.point) IS NULL) THEN
        -- Claiming unclaimed (level 0) point: Set to level 1 with half health
        UPDATE point
        SET level = 1,
            max_health = get_health_per_point_level(),
            health = get_health_per_point_level() / 2,
            acquired_by = v_user_faction_id
        WHERE point.id = new.point;
    END IF;

    -- Handle repair
    IF (new.type = 'repair') THEN
        UPDATE point
        SET health = (
            LEAST (
                (select point.max_health from point where point.id = new.point),
                ((select point.health from point where point.id = new.point) + new.strength)
            )
        )
        WHERE point.id = new.point;
    END IF;

    -- Update user stats
    UPDATE public.user_game_data
    SET last_action = NOW(), experience = experience + new.rewarded_experience
    WHERE public.user_game_data.user_id = new.created_by;

    RETURN new;
END;
$function$;
