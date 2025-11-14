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
		error as mapError
	} from '../mapStore';
	import type { MapPoint } from '../map.types';
	import { createEventDispatcher } from 'svelte';
	import { user } from '../../supabase/user/user.svelte';

	export let selectedPointId: string | null = null;

	const dispatch = createEventDispatcher<{
		pointClick: { point: MapPoint };
		mapReady: { map: L.Map };
	}>();

	let mapContainer: HTMLDivElement;
	let map: L.Map | null = null;
	let imageOverlay: L.ImageOverlay | null = null;
	let markers: Map<string, L.CircleMarker> = new Map();
	let currentBounds: L.LatLngBoundsExpression = [
		[0, 0],
		[1000, 1000]
	];

	onMount(async () => {
		// Initialize map system
		await initializeMap();

		if (mapContainer) {
			// Initialize Leaflet map with custom CRS for image coordinates
			map = L.map(mapContainer, {
				crs: L.CRS.Simple,
				minZoom: -2,
				maxZoom: 2,
				zoomControl: true,
				attributionControl: false,
				doubleClickZoom: false,
				scrollWheelZoom: true,
				dragging: true,
				zoomSnap: 0.5,
				zoomDelta: 0.5,
				wheelPxPerZoomLevel: 60,
				// Mobile optimizations
				touchZoom: true,
				tapTolerance: 15
			} as L.MapOptions);

			// Set initial view
			map.fitBounds(currentBounds);

			// Add touch-friendly zoom control positioning
			if (map.zoomControl) {
				map.zoomControl.setPosition('bottomright');
			}

			// Dispatch map ready event
			dispatch('mapReady', { map });
		}
	});

	onDestroy(async () => {
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

	// Update floor plan image when floor changes
	$: if (map && $currentFloor) {
		// Remove old overlay
		if (imageOverlay) {
			imageOverlay.remove();
		}

		// Calculate bounds based on image dimensions
		// Use actual image dimensions if available, otherwise default to 1000x1000
		const imageWidth = $currentFloor.image_width || 1000;
		const imageHeight = $currentFloor.image_height || 1000;

		// Set bounds with proper aspect ratio
		// Leaflet uses [y, x] for coordinates (lat, lng)
		currentBounds = [
			[0, 0],
			[imageHeight, imageWidth]
		];

		// Add new floor plan image
		imageOverlay = L.imageOverlay($currentFloor.map_image_url, currentBounds).addTo(map);

		// Fit bounds to show the entire image
		map.fitBounds(currentBounds);

		// Clear existing markers since they're for the old floor
		markers.forEach((marker) => marker.remove());
		markers.clear();
	}

	// Update markers when visible points change
	$: if (map && $visiblePoints && $currentFloor) {
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

		// Add or update markers
		points.forEach((point) => {
			let marker = markers.get(point.id);

			// Convert point coordinates to Leaflet LatLng
			// Point coordinates should be in the same coordinate system as the image
			// Y coordinate is inverted for Leaflet (0 at top)
			const latLng: L.LatLngExpression = [point.position.y, point.position.x];

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

<div class="map-view">
	{#if $isLoading}
		<div class="loading-overlay">
			<div class="spinner"></div>
			<p>Loading map...</p>
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
		background: #f5f5f5;
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
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #4caf50;
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
		color: #666;
	}

	.error-overlay {
		position: absolute;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2000;
	}

	.error-message {
		background: #ffebee;
		color: #c62828;
		padding: 15px 20px;
		border-radius: 8px;
		border: 1px solid #ef5350;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		margin: 0;
		font-size: 14px;
	}

	/* Override Leaflet default styles */
	:global(.leaflet-container) {
		background: #f5f5f5;
		font-family: inherit;
	}

	:global(.leaflet-control-zoom) {
		border: none;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	:global(.leaflet-control-zoom a) {
		background: white;
		color: #333;
		border-bottom: 1px solid #ddd;
	}

	:global(.leaflet-control-zoom a:hover) {
		background: #f5f5f5;
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
