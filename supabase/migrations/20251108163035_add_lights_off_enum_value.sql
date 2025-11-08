-- Add 'lights-off' to the puzzle-type enum
-- This must be in a separate migration that runs BEFORE using the new value
-- because ALTER TYPE ADD VALUE cannot be used in the same transaction
-- as operations that use the new value
ALTER TYPE "public"."puzzle-type" ADD VALUE IF NOT EXISTS 'lights-off';
