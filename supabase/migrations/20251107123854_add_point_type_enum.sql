-- Add point_type enum
CREATE TYPE public.point_type AS ENUM ('claimable', 'not_claimable');

-- Add type column to point table, default to 'claimable'
ALTER TABLE public.point ADD COLUMN type public.point_type NOT NULL DEFAULT 'claimable';

-- Optional: Update existing points to have 'claimable' type (if needed)
-- UPDATE public.point SET type = 'claimable' WHERE type IS NULL;
