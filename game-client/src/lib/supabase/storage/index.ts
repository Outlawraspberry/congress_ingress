/**
 * Supabase Storage Utilities
 *
 * Export all image storage utilities for easy importing
 */

export {
	// Main functions
	uploadImage,
	uploadMultipleImages,
	deleteImage,
	deleteMultipleImages,
	listImages,
	listCategories,
	getImageInfo,
	replaceImage,
	downloadImage,

	// Validation and helpers
	validateImageFile,
	sanitizeFilename,
	generateUniqueFilename,
	buildFilePath,
	getImagePublicUrl,
	extractFilePathFromUrl,
	getCategoryFromPath,
	checkAdminPermission,
	formatFileSize,
	getImageDimensions,

	// Constants
	IMAGES_BUCKET,
	IMAGE_CATEGORIES,
	ALLOWED_IMAGE_TYPES,
	MAX_FILE_SIZE,

	// Types
	type ImageCategory,
	type UploadResult,
	type ImageFile,
	type UploadOptions
} from './imageStorage';
