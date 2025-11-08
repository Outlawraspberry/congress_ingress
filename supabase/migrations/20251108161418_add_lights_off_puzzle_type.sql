-- Add 'lights-off' to the puzzle-type enum
ALTER TYPE "public"."puzzle-type" ADD VALUE 'lights-off';

-- Add lights-off configuration to puzzle_config table
-- timeout: 15 minutes (900 seconds) for lights-off puzzles
-- ap_gain: 2 action points for solving lights-off puzzles
INSERT INTO public.puzzle_config (type, timeout, ap_gain)
VALUES ('lights-off'::"puzzle-type", 15, 2);
