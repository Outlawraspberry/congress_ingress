/**
 * General Purpose Image Storage Utilities
 *
 * Handles uploading, retrieving, and managing images in Supabase Storage.
 * Supports multiple image categories (floor plans, points, puzzles, etc.)
 * Only admins can upload/delete images. All users can view.
 */

import { supabase } from '../db.svelte';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const IMAGES_BUCKET = 'images';

/**
 * Image categories for organizing storage
 */
export const IMAGE_CATEGORIES = {
	FLOOR_PLANS: 'floor-plans',
	POINTS: 'points',
	PUZZLES: 'puzzles',
	FACTIONS: 'factions',
	UI: 'ui',
	ACHIEVEMENTS: 'achievements',
	EVENTS: 'events'
} as const;

export type ImageCategory = (typeof IMAGE_CATEGORIES)[keyof typeof IMAGE_CATEGORIES];

/**
 * Supported image formats
 */
export const ALLOWED_IMAGE_TYPES = [
	'image/png',
	'image/jpeg',
	'image/jpg',
	'image/svg+xml',
	'image/webp',
	'image/gif'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Result of an upload operation
 */
export interface UploadResult {
	success: boolean;
	publicUrl?: string;
	filePath?: string;
	error?: string;
}

/**
 * Information about a stored image file
 */
export interface ImageFile {
	name: string;
	path: string;
	publicUrl: string;
	size: number;
	mimeType: string;
	category?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
	category?: ImageCategory | string;
	customPath?: string;
	overwrite?: boolean;
}

/**
 * Validates if a file is a valid image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
		};
	}

	// Check file type
	if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
		};
	}

	return { valid: true };
}

/**
 * Sanitizes a filename to be storage-safe
 */
export function sanitizeFilename(filename: string): string {
	return filename
		.toLowerCase()
		.replace(/[^a-z0-9._-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Generates a unique filename with timestamp
 * Format: [timestamp]-[sanitized-name].[ext]
 */
export function generateUniqueFilename(originalName: string): string {
	const timestamp = Date.now();
	const sanitized = sanitizeFilename(originalName);
	return `${timestamp}-${sanitized}`;
}

/**
 * Builds a file path with optional category folder
 */
export function buildFilePath(filename: string, category?: string): string {
	if (category) {
		return `${category}/${filename}`;
	}
	return filename;
}

/**
 * Gets the public URL for an image file path
 */
export function getImagePublicUrl(filePath: string): string {
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGES_BUCKET}/${filePath}`;
}

/**
 * Uploads an image to Supabase Storage
 *
 * @param file - The image file to upload
 * @param options - Upload options
 * @returns Upload result with public URL
 */
export async function uploadImage(file: File, options?: UploadOptions): Promise<UploadResult> {
	try {
		// Validate file
		const validation = validateImageFile(file);
		if (!validation.valid) {
			return {
				success: false,
				error: validation.error
			};
		}

		// Generate file path
		let filePath: string;
		if (options?.customPath) {
			filePath = options.customPath;
		} else {
			const filename = generateUniqueFilename(file.name);
			filePath = buildFilePath(filename, options?.category);
		}

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage.from(IMAGES_BUCKET).upload(filePath, file, {
			cacheControl: '3600',
			upsert: options?.overwrite || false
		});

		if (error) {
			return {
				success: false,
				error: error.message
			};
		}

		// Get public URL
		const publicUrl = getImagePublicUrl(data.path);

		return {
			success: true,
			publicUrl,
			filePath: data.path
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Uploads multiple images at once
 */
export async function uploadMultipleImages(
	files: File[],
	options?: UploadOptions
): Promise<UploadResult[]> {
	return Promise.all(files.map((file) => uploadImage(file, options)));
}

/**
 * Deletes an image from storage
 *
 * @param filePath - The path of the file to delete
 */
export async function deleteImage(filePath: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { error } = await supabase.storage.from(IMAGES_BUCKET).remove([filePath]);

		if (error) {
			return {
				success: false,
				error: error.message
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Deletes multiple images at once
 */
export async function deleteMultipleImages(
	filePaths: string[]
): Promise<{ success: boolean; error?: string }> {
	try {
		const { error } = await supabase.storage.from(IMAGES_BUCKET).remove(filePaths);

		if (error) {
			return {
				success: false,
				error: error.message
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Lists all images in storage, optionally filtered by category
 */
export async function listImages(options?: {
	category?: ImageCategory | string;
	limit?: number;
	offset?: number;
	sortBy?: 'name' | 'created_at' | 'updated_at';
	search?: string;
}): Promise<{
	files: ImageFile[];
	error?: string;
}> {
	try {
		const path = options?.category || '';

		const { data, error } = await supabase.storage.from(IMAGES_BUCKET).list(path, {
			limit: options?.limit || 100,
			offset: options?.offset || 0,
			sortBy: {
				column: options?.sortBy || 'created_at',
				order: 'desc'
			},
			search: options?.search
		});

		if (error) {
			return {
				files: [],
				error: error.message
			};
		}

		const files: ImageFile[] = data
			.filter((file) => file.id) // Filter out folders
			.map((file) => {
				const fullPath = path ? `${path}/${file.name}` : file.name;
				return {
					name: file.name,
					path: fullPath,
					publicUrl: getImagePublicUrl(fullPath),
					size: file.metadata?.size || 0,
					mimeType: file.metadata?.mimetype || 'unknown',
					category: path || undefined,
					createdAt: file.created_at,
					updatedAt: file.updated_at
				};
			});

		return { files };
	} catch (error) {
		return {
			files: [],
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Lists all available categories (folders) in the images bucket
 */
export async function listCategories(): Promise<{
	categories: string[];
	error?: string;
}> {
	try {
		const { data, error } = await supabase.storage.from(IMAGES_BUCKET).list('', {
			limit: 100
		});

		if (error) {
			return {
				categories: [],
				error: error.message
			};
		}

		// Filter to get only folders (items without id are folders)
		const categories = data.filter((item) => !item.id).map((item) => item.name);

		return { categories };
	} catch (error) {
		return {
			categories: [],
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Gets information about a specific image file
 */
export async function getImageInfo(filePath: string): Promise<{
	file?: ImageFile;
	error?: string;
}> {
	try {
		// Extract folder and filename from path
		const pathParts = filePath.split('/');
		const filename = pathParts.pop() || '';
		const folder = pathParts.join('/');

		const { data, error } = await supabase.storage.from(IMAGES_BUCKET).list(folder, {
			search: filename
		});

		if (error) {
			return { error: error.message };
		}

		const file = data.find((f) => f.name === filename);
		if (!file) {
			return { error: 'File not found' };
		}

		return {
			file: {
				name: file.name,
				path: filePath,
				publicUrl: getImagePublicUrl(filePath),
				size: file.metadata?.size || 0,
				mimeType: file.metadata?.mimetype || 'unknown',
				category: folder || undefined,
				createdAt: file.created_at,
				updatedAt: file.updated_at
			}
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Replaces an existing image with a new one
 */
export async function replaceImage(oldFilePath: string, newFile: File): Promise<UploadResult> {
	try {
		// Delete the old file
		const deleteResult = await deleteImage(oldFilePath);
		if (!deleteResult.success) {
			return {
				success: false,
				error: `Failed to delete old file: ${deleteResult.error}`
			};
		}

		// Upload the new file with the same path
		return uploadImage(newFile, {
			customPath: oldFilePath,
			overwrite: true
		});
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Downloads an image file as a blob
 */
export async function downloadImage(filePath: string): Promise<{
	blob?: Blob;
	error?: string;
}> {
	try {
		const { data, error } = await supabase.storage.from(IMAGES_BUCKET).download(filePath);

		if (error) {
			return { error: error.message };
		}

		return { blob: data };
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Extracts the file path from a full public URL
 */
export function extractFilePathFromUrl(publicUrl: string): string | null {
	const match = publicUrl.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
	return match ? match[1] : null;
}

/**
 * Extracts category from file path
 */
export function getCategoryFromPath(filePath: string): string | null {
	const firstSlash = filePath.indexOf('/');
	if (firstSlash === -1) return null;
	return filePath.substring(0, firstSlash);
}

/**
 * Checks if the current user has admin permissions
 */
export async function checkAdminPermission(): Promise<boolean> {
	try {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return false;

		const { data, error } = await supabase
			.from('user_role')
			.select('role')
			.eq('user_id', user.id)
			.single();

		if (error || !data) return false;

		return data.role === 'admin';
	} catch {
		return false;
	}
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return bytes + ' B';
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Gets dimensions of an image file
 */
export async function getImageDimensions(
	file: File
): Promise<{ width: number; height: number } | null> {
	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.width, height: img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(null);
		};

		img.src = url;
	});
}
