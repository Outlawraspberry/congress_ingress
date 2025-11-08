-- Add lights-off configuration to puzzle_config table
-- Note: The enum value 'lights-off' is added in a separate migration (20251108163035)
-- timeout: 15 minutes for lights-off puzzles
-- ap_gain: 2 action points for solving lights-off puzzles
INSERT INTO public.puzzle_config (type, timeout, ap_gain)
VALUES ('lights-off'::"puzzle-type", 15, 2);
