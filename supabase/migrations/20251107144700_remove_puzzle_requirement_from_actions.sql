-- Remove puzzle requirement from actions table since puzzles are no longer used for actions

-- Drop the foreign key constraint first
ALTER TABLE "public"."actions" DROP CONSTRAINT IF EXISTS "actions_puzzle_fkey";

-- Make puzzle column nullable
ALTER TABLE "public"."actions" ALTER COLUMN "puzzle" DROP NOT NULL;

-- Set default value to NULL for new records
ALTER TABLE "public"."actions" ALTER COLUMN "puzzle" SET DEFAULT NULL;

-- Update any existing records that might have invalid puzzle references
UPDATE "public"."actions" SET "puzzle" = NULL WHERE "puzzle" IS NOT NULL;
