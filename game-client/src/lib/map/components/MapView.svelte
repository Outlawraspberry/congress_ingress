<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import {
		currentFloor,
		visiblePoints,
		initializeMap,
		destroyMap,
		isLoading,
		isSwitchingFloor,
		error as mapError
	} from '../mapStore';
	import type { MapPoint } from '../map.types';
	import { createEventDispatcher } from 'svelte';
	import { user } from '../../supabase/user/user.svelte';

	export let selectedPointId: string | null = null;

	// Tileserver configuration
	// Set useTileServer to true and provide tileServerUrl to use tiles instead of image overlay
	export let useTileServer: boolean = false;
	export let tileServerUrl: string = '';

	const dispatch = createEventDispatcher<{
		pointClick: { point: MapPoint };
		mapReady: { map: L.Map };
	}>();

	let mapContainer: HTMLDivElement;
	let map: L.Map | null = null;
	let imageOverlay: L.ImageOverlay | null = null;
	let oldImageOverlay: L.ImageOverlay | null = null;
	let markers: Map<string, L.CircleMarker> = new Map();
	let currentBounds: L.LatLngBoundsExpression = [
		[0, 0],
		[1000, 1000]
	];
	let lastFloorId: number | null = null;
	let isDarkMode =
		typeof window !== 'undefined'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
			: false;
	let themeMediaQuery: MediaQueryList | null = null;

	// Detect theme changes
	function updateTheme() {
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (map) {
			const bgColor = isDarkMode ? '#1f2937' : '#f5f5f5';
			const container = map.getContainer();
			container.style.background = bgColor;

			// Update zoom control colors
			updateZoomControlColors();
		}
	}

	// Update zoom control colors based on theme
	function updateZoomControlColors() {
		if (!map) return;

		const zoomControls = map.getContainer().querySelectorAll('.leaflet-control-zoom a');
		zoomControls.forEach((control) => {
			if (isDarkMode) {
				(control as HTMLElement).style.background = '#374151';
				(control as HTMLElement).style.color = '#f3f4f6';
				(control as HTMLElement).style.borderBottomColor = '#4b5563';
			} else {
				(control as HTMLElement).style.background = '#ffffff';
				(control as HTMLElement).style.color = '#333333';
				(control as HTMLElement).style.borderBottomColor = '#dddddd';
			}
		});
	}

	onMount(async () => {
		// Initialize map system
		await initializeMap();

		if (mapContainer) {
			// Initialize Leaflet map with custom CRS for image coordinates
			map = L.map(mapContainer, {
				crs: L.CRS.Simple,
				minZoom: -5, // Allow more zoom out for large images
				maxZoom: 3,
				zoomControl: true,
				attributionControl: false,
				doubleClickZoom: false,
				scrollWheelZoom: true,
				dragging: true,
				zoomSnap: 0.25,
				zoomDelta: 0.5,
				wheelPxPerZoomLevel: 60,
				// Mobile optimizations
				touchZoom: true,
				tapTolerance: 15
			} as L.MapOptions);

			// Set initial view - fit to fill viewport nicely
			// Don't set maxZoom here to let it zoom out as needed
			map.fitBounds(currentBounds, {
				padding: [20, 20] // Small padding for better appearance
			});

			// Ensure proper z-index hierarchy for panes
			const overlayPane = map.getPane('overlayPane');
			const markerPane = map.getPane('markerPane');
			const shadowPane = map.getPane('shadowPane');
			const tooltipPane = map.getPane('tooltipPane');

			if (overlayPane) overlayPane.style.zIndex = '400';
			if (shadowPane) shadowPane.style.zIndex = '500';
			if (markerPane) markerPane.style.zIndex = '600';
			if (tooltipPane) tooltipPane.style.zIndex = '650';

			// Add touch-friendly zoom control positioning
			if (map.zoomControl) {
				map.zoomControl.setPosition('bottomright');
			}

			// Set up theme detection
			updateTheme();
			themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			themeMediaQuery.addEventListener('change', updateTheme);

			// Add hover listeners to zoom controls for theme-aware hover effects
			const zoomControls = map.getContainer().querySelectorAll('.leaflet-control-zoom a');
			zoomControls.forEach((control) => {
				control.addEventListener('mouseenter', () => {
					(control as HTMLElement).style.background = isDarkMode ? '#4b5563' : '#f5f5f5';
				});
				control.addEventListener('mouseleave', () => {
					(control as HTMLElement).style.background = isDarkMode ? '#374151' : '#ffffff';
				});
			});

			// Dispatch map ready event
			dispatch('mapReady', { map });
		}
	});

	onDestroy(async () => {
		// Clean up theme listener
		if (themeMediaQuery) {
			themeMediaQuery.removeEventListener('change', updateTheme);
			themeMediaQuery = null;
		}

		// Clean up markers
		markers.forEach((marker) => marker.remove());
		markers.clear();

		// Remove map
		if (map) {
			map.remove();
			map = null;
		}

		// Destroy map system
		await destroyMap();
	});

	// Update floor plan image when floor changes with smooth transition
	$: if (map && $currentFloor && $currentFloor.id !== lastFloorId) {
		updateFloorImage($currentFloor);
	}

	async function updateFloorImage(floor: typeof $currentFloor) {
		if (!map || !floor || floor.id === lastFloorId) return;

		lastFloorId = floor.id;

		// Calculate bounds based on image dimensions
		const imageWidth = floor.image_width || 1000;
		const imageHeight = floor.image_height || 1000;

		// Set bounds with proper aspect ratio
		currentBounds = [
			[0, 0],
			[imageHeight, imageWidth]
		];

		if (useTileServer && tileServerUrl) {
			// Use tileserver mode
			// Remove old image overlay if it exists
			if (imageOverlay) {
				imageOverlay.remove();
				imageOverlay = null;
			}
			if (oldImageOverlay) {
				oldImageOverlay.remove();
				oldImageOverlay = null;
			}

			// Create tile layer for this floor
			// Expected URL format: http://localhost:8080/tiles/{floorId}/{z}/{x}/{y}.png
			const tileUrl = `${tileServerUrl}/${floor.id}/{z}/{x}/{y}.png`;

			const tileLayer = L.tileLayer(tileUrl, {
				tileSize: 256,
				noWrap: true,
				bounds: currentBounds,
				minZoom: -5,
				maxZoom: 3,
				// @ts-ignore - L.CRS.Simple doesn't have all standard options
				tms: false
			});

			tileLayer.addTo(map);

			// Store reference (reuse imageOverlay variable for cleanup)
			imageOverlay = tileLayer as any;
		} else {
			// Use image overlay mode (default)
			// Preload the new image
			const img = new Image();

			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = () => reject(new Error('Failed to load floor image'));
				img.src = floor.map_image_url;
			}).catch((err) => {
				console.error('Error preloading floor image:', err);
				// Continue anyway to show something
			});

			// Store reference to old overlay
			if (imageOverlay) {
				oldImageOverlay = imageOverlay;
			}

			// Create new overlay with opacity 0
			// Explicitly set pane to overlayPane to ensure markers (in markerPane) are above it
			const newOverlay = L.imageOverlay(floor.map_image_url, currentBounds, {
				opacity: 0,
				pane: 'overlayPane'
			});

			newOverlay.addTo(map);
			imageOverlay = newOverlay;

			// Wait a frame for the overlay to be added
			await new Promise((resolve) => requestAnimationFrame(resolve));

			// Fade in the new overlay
			let opacity = 0;
			const fadeIn = () => {
				opacity += 0.1;
				if (opacity >= 1) {
					opacity = 1;
					newOverlay.setOpacity(opacity);

					// Remove old overlay after fade completes
					if (oldImageOverlay) {
						oldImageOverlay.remove();
						oldImageOverlay = null;
					}
				} else {
					newOverlay.setOpacity(opacity);
					requestAnimationFrame(fadeIn);
				}
			};

			requestAnimationFrame(fadeIn);
		}

		// Fit bounds to show the entire image - fill viewport nicely
		// Let it zoom out as needed for large images
		map.fitBounds(currentBounds, {
			padding: [20, 20], // Small padding for better appearance
			animate: true,
			duration: 0.5
		});

		// Don't clear markers here - updateMarkers will handle it
		// Markers are managed by the reactive statement below
		console.log('Floor image updated, waiting for markers to refresh');
	}

	// Update markers when visible points change
	$: if (map && $visiblePoints) {
		console.log('Updating markers, count:', $visiblePoints.length);
		updateMarkers($visiblePoints);
	}

	function updateMarkers(points: MapPoint[]) {
		if (!map || !$currentFloor) return;

		// Get current point IDs
		const currentIds = new Set(points.map((p) => p.id));

		// Remove markers that are no longer visible
		markers.forEach((marker, id) => {
			if (!currentIds.has(id)) {
				marker.remove();
				markers.delete(id);
			}
		});

		// Get image dimensions for coordinate conversion
		const imageWidth = $currentFloor.image_width || 1000;
		const imageHeight = $currentFloor.image_height || 1000;

		// Add or update markers
		points.forEach((point) => {
			let marker = markers.get(point.id);

			// Convert point coordinates from percentages (0-100) to absolute coordinates
			// Point coordinates are stored as percentages in the database
			// Convert to the image coordinate system [0, imageHeight] x [0, imageWidth]
			// NOTE: Y coordinate is inverted because:
			// - Editor uses DOM coordinates (Y=0 at top, Y=100 at bottom)
			// - Leaflet uses geographic coordinates (Y=0 at bottom, Y increases upward)
			const absoluteY = ((100 - point.position.y) / 100) * imageHeight;
			const absoluteX = (point.position.x / 100) * imageWidth;
			const latLng: L.LatLngExpression = [absoluteY, absoluteX];

			if (!marker) {
				// Create new marker
				marker = L.circleMarker(latLng, {
					radius: getMarkerRadius(point.level),
					fillColor: getMarkerColor(point),
					fillOpacity: getMarkerOpacity(point),
					color: getMarkerBorderColor(point),
					weight: point.id === selectedPointId ? 4 : 2
				});

				// Add click handler
				marker.on('click', () => {
					selectedPointId = point.id;
					dispatch('pointClick', { point });
				});

				// Add to map
				marker.addTo(map!);
				markers.set(point.id, marker);

				// Add tooltip if discovered
				if (point.isDiscovered) {
					marker.bindTooltip(point.name, {
						permanent: false,
						direction: 'top'
					});
				}
			} else {
				// Update existing marker
				marker.setLatLng(latLng);
				marker.setStyle({
					radius: getMarkerRadius(point.level),
					fillColor: getMarkerColor(point),
					fillOpacity: getMarkerOpacity(point),
					color: getMarkerBorderColor(point),
					weight: point.id === selectedPointId ? 4 : 2
				});

				// Update tooltip
				if (point.isDiscovered && !marker.getTooltip()) {
					marker.bindTooltip(point.name, {
						permanent: false,
						direction: 'top'
					});
				}
			}
		});
	}

	function getMarkerRadius(level: number): number {
		const baseRadius = 8;
		const radiusPerLevel = 4;
		return baseRadius + level * radiusPerLevel;
	}

	function getMarkerColor(point: MapPoint): string {
		if (!point.isDiscovered && point.type !== 'claimable') {
			return '#E0E0E0'; // Gray for undiscovered
		}

		if (point.factionId === null) {
			return '#9E9E9E'; // Neutral
		}

		if (user.user && point.factionId === user.user.faction) {
			return '#4CAF50'; // Own faction (green)
		}

		return '#f44336'; // Enemy faction (red)
	}

	function getMarkerOpacity(point: MapPoint): number {
		if (!point.isDiscovered && point.type !== 'claimable') {
			return 0.4; // Low opacity for undiscovered
		}

		// Opacity based on health
		const healthPercent = point.maxHealth > 0 ? point.health / point.maxHealth : 1;
		return 0.6 + healthPercent * 0.4; // Range: 0.6 to 1.0
	}

	function getMarkerBorderColor(point: MapPoint): string {
		if (point.id === selectedPointId) {
			return '#FFD700'; // Gold for selected
		}

		// Check if contested (low health)
		const healthPercent = point.maxHealth > 0 ? (point.health / point.maxHealth) * 100 : 100;
		if (healthPercent < 30 && point.factionId !== null) {
			return '#FF9800'; // Orange for contested
		}

		return '#333333'; // Default dark border
	}
</script>

<div class="map-view" style="background: {isDarkMode ? '#1f2937' : '#f5f5f5'}">
	{#if $isLoading}
		<div class="loading-overlay">
			<div class="spinner"></div>
			<p>Loading map...</p>
		</div>
	{/if}

	{#if $isSwitchingFloor}
		<div class="floor-switching-indicator">
			<div class="spinner-small"></div>
		</div>
	{/if}

	{#if $mapError}
		<div class="error-overlay">
			<p class="error-message">❌ {$mapError}</p>
		</div>
	{/if}

	<div bind:this={mapContainer} class="leaflet-map"></div>
</div>

<style>
	.map-view {
		position: relative;
		width: 100%;
		height: 100%;
		background: oklch(var(--b2));
		touch-action: pan-x pan-y;
	}

	.leaflet-map {
		width: 100%;
		height: 100%;
		z-index: 0;
		cursor: grab;
	}

	.leaflet-map:active {
		cursor: grabbing;
	}

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: oklch(var(--b1) / 0.9);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid oklch(var(--b3));
		border-top: 4px solid oklch(var(--p));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-overlay p {
		margin-top: 20px;
		font-size: 16px;
		color: oklch(var(--bc) / 0.7);
	}

	.floor-switching-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1500;
		pointer-events: none;
	}

	.spinner-small {
		width: 40px;
		height: 40px;
		border: 3px solid oklch(var(--b3));
		border-top: 3px solid oklch(var(--p));
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		background: oklch(var(--b1) / 0.8);
	}

	.error-overlay {
		position: absolute;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2000;
	}

	.error-message {
		background: oklch(var(--er) / 0.1);
		color: oklch(var(--er));
		padding: 15px 20px;
		border-radius: 8px;
		border: 1px solid oklch(var(--er) / 0.5);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		margin: 0;
		font-size: 14px;
	}

	/* Override Leaflet default styles */
	:global(.leaflet-container) {
		background: oklch(var(--b2));
		font-family: inherit;
	}

	:global(.leaflet-control-zoom) {
		border: none;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	:global(.leaflet-control-zoom a) {
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		border-bottom: 1px solid oklch(var(--b3));
	}

	:global(.leaflet-control-zoom a:hover) {
		background: oklch(var(--b2));
	}

	:global(.leaflet-tooltip) {
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border: none;
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 12px;
		font-weight: 600;
	}

	:global(.leaflet-tooltip-top:before) {
		border-top-color: rgba(0, 0, 0, 0.8);
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		/* Larger touch targets for zoom controls */
		:global(.leaflet-control-zoom) {
			margin-bottom: 5rem !important;
			margin-right: 0.5rem !important;
		}

		:global(.leaflet-control-zoom a) {
			width: 2.5rem;
			height: 2.5rem;
			line-height: 2.5rem;
			font-size: 1.25rem;
		}

		/* Larger markers on mobile for easier tapping */
		:global(.leaflet-marker-icon),
		:global(.leaflet-marker-pane svg) {
			transform-origin: center;
		}

		/* Better tooltip visibility on mobile */
		:global(.leaflet-tooltip) {
			font-size: 0.75rem;
			padding: 0.375rem 0.625rem;
		}
	}

	/* Small mobile adjustments */
	@media (max-width: 380px) {
		:global(.leaflet-control-zoom) {
			margin-bottom: 4.5rem !important;
		}

		:global(.leaflet-control-zoom a) {
			width: 2.25rem;
			height: 2.25rem;
			line-height: 2.25rem;
		}
	}

	/* Prevent text selection during dragging */
	:global(.leaflet-container) {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	/* iOS Safari specific fixes */
	@supports (-webkit-touch-callout: none) {
		.map-view {
			height: -webkit-fill-available;
		}

		:global(.leaflet-container) {
			-webkit-user-drag: none;
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		}
	}
</style>
