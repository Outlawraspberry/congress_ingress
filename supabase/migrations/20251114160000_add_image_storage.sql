-- Migration: Add General Purpose Image Storage
-- Created: 2025-11-14
-- Description: Creates storage buckets for game g (floor plans, points, puzzles, etc.)

-- Create main game-assets bucket for general game game-assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'game-assets',
    'game-assets',
    true, -- Public bucket so game-assets can be accessed via public URL
    10485760, -- 10MB max file size
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for game-assets bucket

-- Policy: Allow authenticated users to view game-assets (SELECT)
CREATE POLICY "Authenticated users can view game-assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'game-assets');

-- Policy: Allow public (anonymous) users to view game-assets (SELECT)
-- This is needed for public access to game-assets
CREATE POLICY "Public users can view game-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-assets');

-- Policy: Only admins can upload game-assets (INSERT)
CREATE POLICY "Only admins can upload game-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'game-assets' AND
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);

-- Policy: Only admins can update game-assets (UPDATE)
CREATE POLICY "Only admins can update game-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'game-assets' AND
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
)
WITH CHECK (
    bucket_id = 'game-assets' AND
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);

-- Policy: Only admins can delete game-assets (DELETE)
CREATE POLICY "Only admins can delete game-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'game-assets' AND
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);

-- Create helper function to get public URL for an image
CREATE OR REPLACE FUNCTION public.get_image_url(file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    storage_url TEXT;
BEGIN
    -- Get the Supabase URL from settings or use a placeholder
    SELECT current_setting('app.settings.supabase_url', true) INTO storage_url;

    IF storage_url IS NULL THEN
        storage_url := current_setting('request.header.origin', true);
    END IF;

    IF storage_url IS NULL THEN
        -- Fallback - will need to be replaced with actual URL
        storage_url := 'https://your-project.supabase.co';
    END IF;

    RETURN storage_url || '/storage/v1/object/public/game-assets/' || file_path;
END;
$$;

-- Create helper function to validate if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = user_id
        AND user_role.role = 'admin'
    );
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Add comments to
