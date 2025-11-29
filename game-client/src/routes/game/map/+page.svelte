<script lang="ts">
	import MapView from '$lib/map/components/MapView.svelte';
	import FloorSwitcher from '$lib/map/components/FloorSwitcher.svelte';
	import PointInfoPanel from '$lib/map/components/PointInfoPanel.svelte';
	import MapLegend from '$lib/map/components/MapLegend.svelte';
	import type { MapPoint } from '$lib/map/map.types';
	import { goto } from '$app/navigation';
	import { user } from '$lib/supabase/user/user.svelte';
	import { onMount } from 'svelte';

	let selectedPoint: MapPoint | null = null;

	// Redirect to login if not authenticated
	onMount(() => {
		if (!user.user) {
			goto('/login');
		}
	});

	function handlePointClick(event: CustomEvent<{ point: MapPoint }>) {
		selectedPoint = event.detail.point;
	}

	function handleClosePanel() {
		selectedPoint = null;
	}

	function handleNavigate(event: CustomEvent<{ pointId: string }>) {
		console.log('Navigate to point:', event.detail.pointId);
		// TODO: Implement navigation logic
		// This could show the floor and general direction
		// Or integrate with your QR code scanning flow
	}

	function handleAction(event: CustomEvent<{ pointId: string; actionType: string }>) {
		console.log('Action:', event.detail.actionType, 'on point:', event.detail.pointId);
		// TODO: Implement action logic
		// This should redirect to the game/action page or open action modal
		// You might want to check if user is at the point via QR scan first
		goto(`/game?action=${event.detail.actionType}&point=${event.detail.pointId}`);
	}
</script>

<svelte:head>
	<title>Map - Congress Quest</title>
	<meta name="description" content="Tactical map showing all floors and points" />
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
	/>
</svelte:head>

<div class="map-page">
	{#if user.user}
		<MapView selectedPointId={selectedPoint?.id || null} on:pointClick={handlePointClick} />
		<FloorSwitcher />
		<MapLegend />

		{#if selectedPoint}
			<PointInfoPanel
				point={selectedPoint}
				on:close={handleClosePanel}
				on:navigate={handleNavigate}
				on:action={handleAction}
			/>
		{/if}
	{:else}
		<div class="auth-required">
			<div class="message-box">
				<h2>🔒 Authentication Required</h2>
				<p>Please log in to access the map.</p>
				<a href="/login" class="login-button">Go to Login</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.map-page {
		width: 100vw;
		height: 100vh;
		height: 100dvh; /* Use dynamic viewport height for mobile */
		overflow: hidden;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #f5f5f5;
		touch-action: none; /* Prevent default touch behaviors */

		z-index: -1;
	}

	.auth-required {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.message-box {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		text-align: center;
		max-width: 400px;
		width: 100%;
	}

	.message-box h2 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.5rem;
	}

	.message-box p {
		margin: 0 0 1.5rem 0;
		color: #666;
		font-size: 1rem;
	}

	.login-button {
		display: inline-block;
		padding: 0.75rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		font-weight: 600;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.login-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	/* Ensure no scrolling on body */
	:global(body) {
		overflow: hidden;
		position: fixed;
		width: 100%;
		height: 100%;
	}

	:global(html) {
		overflow: hidden;
		height: 100%;
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.message-box {
			padding: 1.5rem;
			margin: 1rem;
		}

		.message-box h2 {
			font-size: 1.25rem;
		}

		.message-box p {
			font-size: 0.875rem;
		}

		.login-button {
			padding: 0.625rem 1.5rem;
			font-size: 0.875rem;
		}
	}

	/* Prevent pull-to-refresh on mobile */
	@media (max-width: 768px) {
		.map-page {
			overscroll-behavior: contain;
		}
	}

	/* Fix for iOS Safari bottom bar */
	@supports (-webkit-touch-callout: none) {
		.map-page {
			height: -webkit-fill-available;
		}
	}
</style>
