import { supabase } from '../supabase/db.svelte';

/**
 * Storage bucket name for game assets
 */
export const GAME_ASSETS_BUCKET = 'game-assets';

/**
 * Check if the game-assets bucket exists
 */
export async function checkBucketExists(): Promise<boolean> {
	try {
		const { data, error } = await supabase.storage.listBuckets();
		if (error) {
			console.error('Error checking buckets:', error);
			return false;
		}
		return data?.some((bucket) => bucket.name === GAME_ASSETS_BUCKET) || false;
	} catch (e) {
		console.error('Error checking bucket:', e);
		return false;
	}
}

/**
 * Create the game-assets bucket if it doesn't exist
 * Note: This requires admin privileges. Run this once from Supabase dashboard or via service role key.
 */
export async function createBucket(): Promise<boolean> {
	try {
		const exists = await checkBucketExists();
		if (exists) {
			console.log('Bucket already exists');
			return true;
		}

		const { error } = await supabase.storage.createBucket(GAME_ASSETS_BUCKET, {
			public: true,
			fileSizeLimit: 5242880, // 5MB
			allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
		});

		if (error) {
			console.error('Error creating bucket:', error);
			return false;
		}

		console.log('Bucket created successfully');
		return true;
	} catch (e) {
		console.error('Error creating bucket:', e);
		return false;
	}
}

/**
 * Upload an image file to the game-assets bucket
 */
export async function uploadImage(
	file: File,
	folder: string = 'floor-maps'
): Promise<{ url: string | null; error: string | null }> {
	try {
		// Validate file
		if (!file.type.startsWith('image/')) {
			return { url: null, error: 'File must be an image' };
		}

		if (file.size > 5 * 1024 * 1024) {
			return { url: null, error: 'Image must be smaller than 5MB' };
		}

		// Generate unique filename
		const fileExt = file.name.split('.').pop();
		const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
		const filePath = `${folder}/${fileName}`;

		// Upload file
		const { error: uploadError } = await supabase.storage
			.from(GAME_ASSETS_BUCKET)
			.upload(filePath, file, {
				cacheControl: '3600',
				upsert: false
			});

		if (uploadError) {
			console.error('Upload error:', uploadError);
			return { url: null, error: uploadError.message };
		}

		// Get public URL
		const {
			data: { publicUrl }
		} = supabase.storage.from(GAME_ASSETS_BUCKET).getPublicUrl(filePath);

		return { url: publicUrl, error: null };
	} catch (e) {
		console.error('Error uploading image:', e);
		return { url: null, error: e instanceof Error ? e.message : 'Failed to upload image' };
	}
}

/**
 * Delete an image from the bucket
 */
export async function deleteImage(url: string): Promise<boolean> {
	try {
		// Extract path from URL
		const urlParts = url.split(`${GAME_ASSETS_BUCKET}/`);
		if (urlParts.length < 2) {
			console.error('Invalid URL format');
			return false;
		}

		const filePath = urlParts[1];

		const { error } = await supabase.storage.from(GAME_ASSETS_BUCKET).remove([filePath]);

		if (error) {
			console.error('Error deleting image:', error);
			return false;
		}

		return true;
	} catch (e) {
		console.error('Error deleting image:', e);
		return false;
	}
}

/**
 * List all images in a folder
 */
export async function listImages(folder: string = 'floor-maps'): Promise<string[]> {
	try {
		const { data, error } = await supabase.storage.from(GAME_ASSETS_BUCKET).list(folder);

		if (error) {
			console.error('Error listing images:', error);
			return [];
		}

		return (data || []).map((file) => {
			const {
				data: { publicUrl }
			} = supabase.storage.from(GAME_ASSETS_BUCKET).getPublicUrl(`${folder}/${file.name}`);
			return publicUrl;
		});
	} catch (e) {
		console.error('Error listing images:', e);
		return [];
	}
}

/**
 * Instructions for setting up the storage bucket
 * Run this SQL in your Supabase SQL editor:
 */
export const SETUP_INSTRUCTIONS = `
-- Create the game-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-assets',
  'game-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access for game-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-assets');

CREATE POLICY "Authenticated users can upload to game-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-assets'
  AND auth.role() = 'authenticated'
);
`;
