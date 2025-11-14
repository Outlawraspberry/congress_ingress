<script lang="ts">
	import {
		uploadImage,
		uploadMultipleImages,
		listImages,
		deleteImage,
		checkAdminPermission,
		validateImageFile,
		getImagePublicUrl,
		formatFileSize,
		getImageDimensions,
		MAX_FILE_SIZE,
		ALLOWED_IMAGE_TYPES,
		IMAGE_CATEGORIES,
		type ImageFile,
		type UploadResult,
		type ImageCategory
	} from '$lib/supabase/storage/imageStorage';
	import { onMount } from 'svelte';

	// Props
	export let category: ImageCategory | string = IMAGE_CATEGORIES.FLOOR_PLANS;
	export let onImageUploaded:
		| ((publicUrl: string, filePath: string) => void | Promise<void>)
		| undefined = undefined;
	export let showFileList = true;
	export let allowMultiple = false;
	export let showCategorySelector = true;

	// State
	let fileInput: HTMLInputElement;
	let uploading = false;
	let loading = false;
	let isAdmin = false;
	let files: ImageFile[] = [];
	let selectedFiles: File[] = [];
	let dragActive = false;
	let uploadProgress: { [filename: string]: UploadResult } = {};
	let error: string | null = null;
	let successMessage: string | null = null;
	let selectedCategory = category;

	onMount(async () => {
		isAdmin = await checkAdminPermission();
		if (isAdmin && showFileList) {
			await loadFiles();
		}
	});

	async function loadFiles() {
		loading = true;
		error = null;
		try {
			const result = await listImages({
				category: selectedCategory,
				limit: 100,
				sortBy: 'created_at'
			});
			if (result.error) {
				error = result.error;
			} else {
				files = result.files;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load files';
		} finally {
			loading = false;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			selectedFiles = Array.from(target.files);
			validateFiles();
		}
	}

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		if (e.dataTransfer?.files) {
			selectedFiles = Array.from(e.dataTransfer.files);
			validateFiles();
		}
	}

	function validateFiles() {
		error = null;
		for (const file of selectedFiles) {
			const validation = validateImageFile(file);
			if (!validation.valid) {
				error = `${file.name}: ${validation.error}`;
				selectedFiles = [];
				return;
			}
		}
	}

	async function handleUpload() {
		if (selectedFiles.length === 0) return;

		uploading = true;
		error = null;
		successMessage = null;
		uploadProgress = {};

		try {
			let results: UploadResult[];

			if (allowMultiple && selectedFiles.length > 1) {
				results = await uploadMultipleImages(selectedFiles, { category: selectedCategory });
			} else {
				results = [await uploadImage(selectedFiles[0], { category: selectedCategory })];
			}

			// Track progress
			results.forEach((result, index) => {
				const filename = selectedFiles[index].name;
				uploadProgress[filename] = result;
			});

			// Check for errors
			const failedUploads = results.filter((r) => !r.success);
			if (failedUploads.length > 0) {
				error = `${failedUploads.length} upload(s) failed: ${failedUploads.map((r) => r.error).join(', ')}`;
			} else {
				successMessage = `Successfully uploaded ${results.length} image(s)`;

				// Success - callback with first file
				if (onImageUploaded && results[0].publicUrl && results[0].filePath) {
					await onImageUploaded(results[0].publicUrl, results[0].filePath);
				}

				// Reload file list
				if (showFileList) {
					await loadFiles();
				}

				// Clear selection
				selectedFiles = [];
				uploadProgress = {};
				if (fileInput) {
					fileInput.value = '';
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	async function handleDelete(filePath: string, fileName: string) {
		if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

		loading = true;
		error = null;
		successMessage = null;

		try {
			const result = await deleteImage(filePath);
			if (result.error) {
				error = result.error;
			} else {
				successMessage = `Successfully deleted "${fileName}"`;
				await loadFiles();
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete file';
		} finally {
			loading = false;
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		successMessage = 'URL copied to clipboard!';
		setTimeout(() => {
			successMessage = null;
		}, 2000);
	}

	function handleCategoryChange() {
		if (showFileList) {
			loadFiles();
		}
	}

	function clearMessages() {
		error = null;
		successMessage = null;
	}
</script>

{#if !isAdmin}
	<div class="error-message">
		<p>⚠️ Admin access required to upload images</p>
	</div>
{:else}
	<div class="image-uploader">
		{#if error}
			<div class="alert alert-error">
				<span>❌ {error}</span>
				<button on:click={clearMessages}>✕</button>
			</div>
		{/if}

		{#if successMessage}
			<div class="alert alert-success">
				<span>✓ {successMessage}</span>
				<button on:click={clearMessages}>✕</button>
			</div>
		{/if}

		<div class="upload-section">
			<h3>Upload Image</h3>

			{#if showCategorySelector}
				<div class="form-group">
					<label for="category-select">Category:</label>
					<select
						id="category-select"
						bind:value={selectedCategory}
						on:change={handleCategoryChange}
						class="category-select"
					>
						{#each Object.entries(IMAGE_CATEGORIES) as [key, value]}
							<option {value}>{key.replace(/_/g, ' ')}</option>
						{/each}
					</select>
				</div>
			{/if}

			<div
				class="drop-zone"
				class:drag-active={dragActive}
				on:dragenter={handleDragEnter}
				on:dragleave={handleDragLeave}
				on:dragover={handleDragOver}
				on:drop={handleDrop}
				role="button"
				tabindex="0"
				on:click={() => fileInput?.click()}
				on:keypress={(e) => e.key === 'Enter' && fileInput?.click()}
			>
				<div class="drop-zone-content">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" y1="3" x2="12" y2="15" />
					</svg>
					<p class="drop-text">
						{#if dragActive}
							Drop files here
						{:else}
							Drag & drop images here, or click to select
						{/if}
					</p>
					<p class="drop-hint">
						Supported: PNG, JPEG, SVG, WebP, GIF (max {MAX_FILE_SIZE / 1024 / 1024}MB)
					</p>
				</div>

				<input
					type="file"
					bind:this={fileInput}
					on:change={handleFileSelect}
					accept={ALLOWED_IMAGE_TYPES.join(',')}
					multiple={allowMultiple}
					style="display: none;"
				/>
			</div>

			{#if selectedFiles.length > 0}
				<div class="selected-files">
					<h4>Selected files:</h4>
					<ul>
						{#each selectedFiles as file}
							<li>{file.name} ({formatFileSize(file.size)})</li>
						{/each}
					</ul>
					<button class="btn btn-primary" on:click={handleUpload} disabled={uploading}>
						{uploading ? 'Uploading...' : 'Upload'}
					</button>
				</div>
			{/if}

			{#if Object.keys(uploadProgress).length > 0}
				<div class="upload-progress">
					<h4>Upload Results:</h4>
					<ul>
						{#each Object.entries(uploadProgress) as [filename, result]}
							<li class:success={result.success} class:error={!result.success}>
								{filename}: {result.success ? '✓ Success' : `✗ ${result.error}`}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		{#if showFileList}
			<div class="file-list-section">
				<div class="section-header">
					<h3>Uploaded Images</h3>
					<button class="btn btn-secondary" on:click={loadFiles} disabled={loading}>
						{loading ? 'Loading...' : 'Refresh'}
					</button>
				</div>

				{#if loading}
					<p class="loading">Loading files...</p>
				{:else if files.length === 0}
					<p class="empty-state">No images found in this category</p>
				{:else}
					<div class="file-grid">
						{#each files as file}
							<div class="file-card">
								<div class="file-preview">
									<img src={file.publicUrl} alt={file.name} loading="lazy" />
								</div>
								<div class="file-info">
									<p class="file-name" title={file.name}>{file.name}</p>
									<p class="file-meta">{formatFileSize(file.size)}</p>
								</div>
								<div class="file-actions">
									<button
										class="btn btn-sm btn-secondary"
										on:click={() => copyToClipboard(file.publicUrl)}
										title="Copy URL"
									>
										📋 Copy URL
									</button>
									<button
										class="btn btn-sm btn-secondary"
										on:click={() => copyToClipboard(file.path)}
										title="Copy Path"
									>
										📄 Copy Path
									</button>
									<button
										class="btn btn-sm btn-danger"
										on:click={() => handleDelete(file.path, file.name)}
										disabled={loading}
										title="Delete"
									>
										🗑️ Delete
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.image-uploader {
		padding: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.alert {
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.alert-error {
		background-color: #fee;
		border: 1px solid #fcc;
		color: #c00;
	}

	.alert-success {
		background-color: #efe;
		border: 1px solid #cfc;
		color: #060;
	}

	.alert button {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0 0.5rem;
	}

	.upload-section {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.category-select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		font-size: 1rem;
	}

	.drop-zone {
		border: 2px dashed #ccc;
		border-radius: 0.5rem;
		padding: 3rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 1rem;
	}

	.drop-zone:hover {
		border-color: #666;
		background-color: #f9f9f9;
	}

	.drop-zone.drag-active {
		border-color: #4caf50;
		background-color: #e8f5e9;
	}

	.drop-zone-content svg {
		color: #666;
		margin-bottom: 1rem;
	}

	.drop-text {
		font-size: 1.1rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.drop-hint {
		font-size: 0.9rem;
		color: #666;
	}

	.selected-files {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f5f5f5;
		border-radius: 0.5rem;
	}

	.selected-files h4 {
		margin-top: 0;
	}

	.selected-files ul {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0;
	}

	.selected-files li {
		padding: 0.25rem 0;
	}

	.upload-progress {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f5f5f5;
		border-radius: 0.5rem;
	}

	.upload-progress h4 {
		margin-top: 0;
	}

	.upload-progress ul {
		list-style: none;
		padding: 0;
	}

	.upload-progress li {
		padding: 0.25rem 0;
	}

	.upload-progress li.success {
		color: #060;
	}

	.upload-progress li.error {
		color: #c00;
	}

	.file-list-section {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section-header h3 {
		margin: 0;
	}

	.loading,
	.empty-state {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.file-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.file-card {
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: box-shadow 0.3s ease;
	}

	.file-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.file-preview {
		aspect-ratio: 16 / 9;
		background-color: #f5f5f5;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.file-preview img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.file-info {
		padding: 0.75rem;
		background-color: #fafafa;
	}

	.file-name {
		margin: 0 0 0.25rem 0;
		font-size: 0.9rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-meta {
		margin: 0;
		font-size: 0.8rem;
		color: #666;
	}

	.file-actions {
		padding: 0.5rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		background-color: #f0f0f0;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: #4caf50;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #45a049;
	}

	.btn-secondary {
		background-color: #2196f3;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #0b7dda;
	}

	.btn-danger {
		background-color: #f44336;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #da190b;
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		flex: 1;
		min-width: 0;
	}

	.error-message {
		padding: 2rem;
		text-align: center;
		color: #c00;
		background-color: #fee;
		border-radius: 0.5rem;
	}
</style>
