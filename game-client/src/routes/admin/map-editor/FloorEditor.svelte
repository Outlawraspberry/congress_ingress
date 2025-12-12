<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import type { Floor } from '$lib/map/map.types';
	import { uploadImage, deleteImage } from '$lib/map/storage';

	interface Props {
		floor: Floor | null;
		onSave: () => void;
		onCancel: () => void;
	}

	let { floor, onSave, onCancel }: Props = $props();

	let name = $state(floor?.name || '');
	let buildingName = $state(floor?.building_name || '');
	let displayOrder = $state(floor?.display_order || 0);
	let isActive = $state(floor?.is_active ?? true);
	let mapImageUrl = $state(floor?.map_image_url || '');
	let isSaving = $state(false);
	let error: string | null = $state(null);
	let imageFile: File | null = $state(null);
	let imagePreview: string | null = $state(floor?.map_image_url || null);
	let isUploading = $state(false);
	let imageWidth: number | null = $state(floor?.image_width || null);
	let imageHeight: number | null = $state(floor?.image_height || null);

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			if (!file.type.startsWith('image/')) {
				error = 'Please select an image file';
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				error = 'Image must be smaller than 5MB';
				return;
			}

			imageFile = file;
			error = null;

			// Create preview and extract dimensions
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				imagePreview = result;

				// Load image to get dimensions
				const img = new Image();
				img.onload = () => {
					imageWidth = img.width;
					imageHeight = img.height;
				};
				img.src = result;
			};
			reader.readAsDataURL(file);
		}
	}

	async function uploadFloorImage(): Promise<string | null> {
		if (!imageFile) return mapImageUrl || null;

		try {
			isUploading = true;
			const { url, error: uploadError } = await uploadImage(imageFile, 'floor-maps');

			if (uploadError) {
				error = uploadError;
				return null;
			}

			return url;
		} catch (e) {
			console.error('Error uploading image:', e);
			error = e instanceof Error ? e.message : 'Failed to upload image';
			return null;
		} finally {
			isUploading = false;
		}
	}

	async function handleSave() {
		if (!name.trim()) {
			error = 'Floor name is required';
			return;
		}

		try {
			isSaving = true;
			error = null;

			// Upload image if a new one was selected
			let finalImageUrl = mapImageUrl;
			if (imageFile) {
				const uploadedUrl = await uploadFloorImage();
				if (!uploadedUrl) {
					error = 'Failed to upload image';
					return;
				}
				// Delete old image if updating and URL changed
				if (floor && floor.map_image_url && floor.map_image_url !== uploadedUrl) {
					await deleteImage(floor.map_image_url);
				}
				finalImageUrl = uploadedUrl;
			}

			const floorData = {
				name: name.trim(),
				building_name: buildingName.trim() || null,
				display_order: displayOrder,
				is_active: isActive,
				map_image_url: finalImageUrl,
				image_width: imageWidth,
				image_height: imageHeight
			};

			if (floor) {
				// Update existing floor
				const { error: updateError } = await supabase
					.from('floors')
					.update(floorData)
					.eq('id', floor.id);

				if (updateError) throw updateError;
			} else {
				// Create new floor
				const { error: insertError } = await supabase.from('floors').insert(floorData);

				if (insertError) throw insertError;
			}

			onSave();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save floor';
			console.error('Error saving floor:', e);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (imagePreview && imagePreview !== floor?.map_image_url) {
			URL.revokeObjectURL(imagePreview);
		}
		onCancel();
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{floor ? 'Edit Floor' : 'Add New Floor'}</h2>

		{#if error}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		<div class="form-control w-full">
			<label class="label" for="floor-name">
				<span class="label-text">Floor Name *</span>
			</label>
			<input
				id="floor-name"
				type="text"
				placeholder="e.g., Ground Floor, 1st Floor"
				class="input input-bordered w-full"
				bind:value={name}
				disabled={isSaving}
			/>
		</div>

		<div class="form-control w-full">
			<label class="label" for="building-name">
				<span class="label-text">Building Name (optional)</span>
			</label>
			<input
				id="building-name"
				type="text"
				placeholder="e.g., Main Building, Tower A"
				class="input input-bordered w-full"
				bind:value={buildingName}
				disabled={isSaving}
			/>
		</div>

		<div class="form-control w-full">
			<label class="label" for="display-order">
				<span class="label-text">Display Order</span>
			</label>
			<input
				id="display-order"
				type="number"
				placeholder="0"
				class="input input-bordered w-full"
				bind:value={displayOrder}
				disabled={isSaving}
			/>
			<label class="label">
				<span class="label-text-alt">Lower numbers appear first in lists</span>
			</label>
		</div>

		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-2">
				<input type="checkbox" class="checkbox" bind:checked={isActive} disabled={isSaving} />
				<span class="label-text">Active (visible to players)</span>
			</label>
		</div>

		<div class="form-control w-full">
			<label class="label" for="floor-image">
				<span class="label-text">Floor Plan Image</span>
			</label>
			<input
				id="floor-image"
				type="file"
				accept="image/*"
				class="file-input file-input-bordered w-full"
				onchange={handleFileChange}
				disabled={isSaving || isUploading}
			/>
			<label class="label">
				<span class="label-text-alt">Maximum file size: 5MB</span>
			</label>
		</div>

		{#if imagePreview}
			<div class="form-control w-full">
				<label class="label">
					<span class="label-text">Preview</span>
				</label>
				<div class="border-base-300 relative aspect-video overflow-hidden rounded-lg border">
					<img src={imagePreview} alt="Floor plan preview" class="h-full w-full object-contain" />
				</div>
				{#if imageWidth && imageHeight}
					<label class="label">
						<span class="label-text-alt">Dimensions: {imageWidth} × {imageHeight} pixels</span>
					</label>
				{/if}
			</div>
		{/if}

		<div class="card-actions justify-end gap-2">
			<button class="btn btn-ghost" onclick={handleCancel} disabled={isSaving || isUploading}>
				Cancel
			</button>
			<button
				class="btn btn-primary"
				onclick={handleSave}
				disabled={isSaving || isUploading || !name.trim()}
			>
				{#if isSaving || isUploading}
					<span class="loading loading-spinner"></span>
					{isUploading ? 'Uploading...' : 'Saving...'}
				{:else}
					{floor ? 'Update Floor' : 'Create Floor'}
				{/if}
			</button>
		</div>
	</div>
</div>
