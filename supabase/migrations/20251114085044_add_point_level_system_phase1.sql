-- Phase 1: Database Schema & Configuration for Point Level System
-- This migration adds the foundational schema changes needed for the point level system

-- Step 1: Add Configuration Columns to `game` Table
ALTER TABLE public.game
ADD COLUMN max_point_level INTEGER NOT NULL DEFAULT 3,
ADD COLUMN health_per_point_level INTEGER NOT NULL DEFAULT 255,
ADD COLUMN upgrade_point_ap_cost INTEGER NOT NULL DEFAULT 50;

COMMENT ON COLUMN game.max_point_level IS 'Maximum level a point can be upgraded to';
COMMENT ON COLUMN game.health_per_point_level IS 'Health points added per level';
COMMENT ON COLUMN game.upgrade_point_ap_cost IS 'Action points required to upgrade a point';

-- Add constraints to ensure configuration values are valid
ALTER TABLE public.game
ADD CONSTRAINT game_max_point_level_check CHECK (max_point_level > 0 AND max_point_level <= 10);

ALTER TABLE public.game
ADD CONSTRAINT game_health_per_point_level_check CHECK (health_per_point_level > 0);

ALTER TABLE public.game
ADD CONSTRAINT game_upgrade_point_ap_cost_check CHECK (upgrade_point_ap_cost > 0);

-- Step 2: Add `level` Column to `point` Table
ALTER TABLE public.point
ADD COLUMN level INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN point.level IS 'Current level of the point (0 = unclaimed, 1-3 = claimed levels)';

-- Add constraint to ensure level is within valid range
-- Note: This allows 0-3 by default, but will be validated against max_point_level in functions
ALTER TABLE public.point
ADD CONSTRAINT point_level_valid CHECK (level >= 0 AND level <= 10);

-- Step 3: Update Existing Points
-- Initialize all existing claimed points to level 1 with proper max_health
UPDATE public.point
SET level = 1,
    max_health = 255
WHERE type = 'claimable' AND acquired_by IS NOT NULL;

-- Set unclaimed points to level 0
UPDATE public.point
SET level = 0,
    max_health = 0
WHERE acquired_by IS NULL AND type = 'claimable';

-- Non-claimable points remain at level 1 (default)
-- They don't participate in the level system but need a valid level value
