-- Migration: Add Admin Policies for Point Management
-- Created: 2025-11-14 17:00:00
-- Description: Enables RLS and adds policies for admins to manage points (create, read, update, delete)

-- Enable Row Level Security on point table
ALTER TABLE public.point ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view points (SELECT)
-- This is needed for the game to display points to all users
CREATE POLICY "Everyone can view points"
ON public.point FOR SELECT
TO public
USING (true);

-- Policy: Only admins can create points (INSERT)
CREATE POLICY "Only admins can create points"
ON public.point FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);

-- Policy: Only admins can update points (UPDATE)
CREATE POLICY "Only admins can update points"
ON public.point FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);

-- Policy: Only admins can delete points (DELETE)
CREATE POLICY "Only admins can delete points"
ON public.point FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);

-- Add comment to document the policies
COMMENT ON TABLE public.point IS 'Game points with RLS enabled. Admins can create, update, and delete. Everyone can view.';
