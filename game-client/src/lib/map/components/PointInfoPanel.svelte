<script lang="ts">
	import type { MapPoint, PointVisibilityInfo } from '../map.types';
	import { determinePointVisibility, getDisplayPointState } from '../visibilityRules';
	import { getHealthPercentage, getPointStatus } from '../map.types';
	import { formatTimeSinceUpdate } from '../mapStorage';
	import { discoveries, enemyCache, playerPresence } from '../mapStore';
	import { user } from '../../supabase/user/user.svelte';
	import { createEventDispatcher } from 'svelte';

	export let point: MapPoint | null;

	const dispatch = createEventDispatcher<{
		close: void;
		navigate: { pointId: string };
		action: { pointId: string; actionType: string };
	}>();

	$: isDiscovered = point && $discoveries ? $discoveries.has(point.id) : false;
	$: cache = point && $enemyCache ? $enemyCache.get(point.id) || null : null;
	$: visibility = point
		? determinePointVisibility(point, user.user?.faction || '', isDiscovered, cache)
		: null;
	$: displayState =
		point && visibility
			? getDisplayPointState(point, user.user?.faction || '', isDiscovered, cache)
			: null;
	$: healthPercent = point ? getHealthPercentage(point) : 0;
	$: status = point ? getPointStatus(point) : '';
	$: presenceCount = point && $playerPresence ? $playerPresence.get(point.id) || 0 : 0;

	function handleClose() {
		dispatch('close');
	}

	function getFactionBadgeColor(factionId: string | null): string {
		if (factionId === null) return '#9E9E9E';
		if (factionId === (user.user?.faction || '')) return '#4CAF50';
		return '#f44336';
	}
</script>

{#snippet content(point: MapPoint, visibility: PointVisibilityInfo)}
	{#if visibility.showDetails && displayState}
		<!-- Faction Ownership -->
		{#if point.type === 'claimable'}
			<div class="info-section">
				<div class="section-title">Ownership</div>
				<div
					class="badge badge-lg faction-badge"
					style="background: {getFactionBadgeColor(displayState.factionId)}; color: white;"
				>
					{#if displayState.factionId === null}
						Neutral
					{:else if displayState.factionId === (user.user?.faction || '')}
						Your Faction
					{:else}
						Enemy Faction
					{/if}
				</div>
			</div>

			<!-- Level -->
			<div class="info-row">
				<span class="label">Level:</span>
				<span class="value">
					<span class="badge badge-primary level-badge">Lv. {displayState.level}</span>
				</span>
			</div>

			<!-- Health -->
			<div class="info-section">
				<div class="info-row">
					<span class="label">Health:</span>
					<span class="value">
						{displayState.health} / {displayState.maxHealth}
						<span
							class="badge badge-sm status-badge"
							class:badge-success={healthPercent > 75}
							class:badge-warning={healthPercent <= 75 && healthPercent > 25}
							class:badge-error={healthPercent <= 25}
						>
							{status}
						</span>
					</span>
				</div>

				<!-- Health Bar -->
				<div class="health-bar-container">
					<progress
						class="progress w-full"
						class:progress-success={healthPercent > 75}
						class:progress-warning={healthPercent <= 75 && healthPercent > 25}
						class:progress-error={healthPercent <= 25}
						value={healthPercent}
						max="100"
					></progress>
					<span class="health-percent">{Math.round(healthPercent)}%</span>
				</div>
			</div>

			<!-- Cache Status / Real-time Indicator -->
			{#if displayState.isCached && displayState.lastUpdated}
				<div class="alert alert-warning cache-warning">
					<span class="icon">⚠️</span>
					<div class="warning-content">
						<div class="warning-title">Cached Information</div>
						<div class="warning-text">
							Last updated: {formatTimeSinceUpdate(displayState.lastUpdated)}
						</div>
					</div>
				</div>
			{:else if visibility.showRealTime}
				<div class="alert alert-success realtime-indicator">
					<span class="pulse"></span>
					<span>Real-time updates</span>
				</div>
			{/if}
		{/if}

		<!-- Player Presence -->
		{#if presenceCount > 0}
			<div class="presence-section">
				<span class="presence-icon">👥</span>
				<span class="presence-text">
					{presenceCount} faction {presenceCount === 1 ? 'member' : 'members'} present
				</span>
			</div>
		{/if}

		<!-- Position Info -->
		<div class="info-row small">
			<span class="label">Position:</span>
			<span class="value">
				({Math.round(point.position.x)}, {Math.round(point.position.y)})
			</span>
		</div>
	{:else}
		<!-- Point not discovered -->
		<div class="undiscovered-message">
			<span class="icon">🔒</span>
			<p>Visit this point to reveal its details</p>
		</div>
	{/if}{/snippet}

{#snippet contentHeader(point: MapPoint, visibility: PointVisibilityInfo)}
	<h2 class="point-name">
		{#if visibility.showName}
			{point.name}
		{:else}
			<span class="unknown">Unknown Point</span>
		{/if}
	</h2>
	<div class="point-type-badge" class:mini-game={point.type === 'mini_game'}>
		{point.type === 'claimable' ? '🎯 Claimable' : ''}
		{point.type === 'mini_game' ? '🎮 Mini-game' : ''}
		{point.type === 'not_claimable' ? '🚫 Not Claimable' : ''}
	</div>{/snippet}

{#if point && visibility}
	<!-- Mobile: Bottom Drawer -->
	<div class="mobile-panel drawer drawer-end drawer-open">
		<input id="point-info-drawer" type="checkbox" class="drawer-toggle" checked />
		<div
			class="panel-overlay"
			on:click={handleClose}
			on:keydown={handleClose}
			role="button"
			tabindex="0"
		></div>
		<div class="drawer-side">
			<div
				role="button"
				tabindex="0"
				class="drawer-overlay"
				on:click={handleClose}
				on:keydown={handleClose}
			></div>
			<div class="drawer-content-wrapper bg-base-100">
				<div class="panel-header">
					<div class="header-content">
						{@render contentHeader(point, visibility)}
					</div>
					<button class="btn btn-sm btn-circle btn-ghost close-button" on:click={handleClose}>
						✕
					</button>
				</div>

				<div class="panel-content">
					{@render content(point, visibility)}
				</div>
			</div>
		</div>
	</div>

	<!-- Desktop: Side Panel (hidden on mobile) -->
	<div class="desktop-panel">
		<div
			class="panel-overlay"
			on:click={handleClose}
			on:keydown={handleClose}
			role="button"
			tabindex="0"
		></div>
		<div class="panel card bg-base-100 shadow-xl">
			<div class="panel-header">
				<div class="header-content">
					{@render contentHeader(point, visibility)}
				</div>
				<button class="btn btn-sm btn-circle btn-ghost close-button" on:click={handleClose}
					>✕</button
				>
			</div>

			<div class="panel-content">
				{@render content(point, visibility)}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Mobile Panel - Bottom Drawer */
	.mobile-panel {
		display: block;
		position: fixed;
		bottom: -10rem;
		left: 0;
		right: 0;
		z-index: 2000;
	}

	.drawer-content-wrapper {
		width: 100vw;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideUp 0.3s ease-out;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.drawer-handle-area {
		padding: 0.75rem;
		display: flex;
		justify-content: center;
		cursor: grab;
	}

	.drawer-handle {
		width: 3rem;
		height: 0.25rem;
		background: #d1d5db;
		border-radius: 0.125rem;
	}

	/* Desktop Panel - Side Panel */
	.desktop-panel {
		display: none;
	}

	.panel-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 1999;
	}

	.panel {
		position: fixed;
		right: 1.25rem;
		top: 1.25rem;
		bottom: 1.25rem;
		width: 350px;
		max-height: calc(100vh - 2.5rem);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideIn 0.3s ease-out;
		z-index: 2000;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(1.25rem);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1rem 1.25rem;
		border-bottom: 2px solid #f0f0f0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		flex-shrink: 0;
	}

	.header-content {
		flex: 1;
		min-width: 0;
	}

	.point-name {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 700;
		word-wrap: break-word;
	}

	.unknown {
		opacity: 0.8;
		font-style: italic;
	}

	.point-type-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.point-type-badge.mini-game {
		background: rgba(255, 215, 0, 0.3);
	}

	.close-button {
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem 1.25rem;
		-webkit-overflow-scrolling: touch;
	}

	.info-section {
		margin-bottom: 1.25rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
		letter-spacing: 0.03125rem;
	}

	.faction-badge {
		font-weight: 600;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		gap: 0.5rem;
	}

	.info-row.small {
		font-size: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.label {
		font-weight: 600;
		flex-shrink: 0;
	}

	.value {
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.level-badge {
		font-weight: 700;
	}

	.status-badge {
		font-weight: 600;
		text-transform: uppercase;
	}

	.health-bar-container {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-top: 0.5rem;
	}

	.health-percent {
		font-size: 0.875rem;
		font-weight: 700;
		min-width: 2.8125rem;
		text-align: right;
		flex-shrink: 0;
	}

	.cache-warning,
	.realtime-indicator {
		margin-top: 1rem;
		font-size: 0.8125rem;
	}

	.warning-content {
		flex: 1;
	}

	.warning-title {
		font-weight: 600;
		margin-bottom: 0.125rem;
	}

	.warning-text {
		font-size: 0.75rem;
	}

	.pulse {
		width: 0.5rem;
		height: 0.5rem;
		background: currentColor;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}

	.presence-section {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem;
		background: #e3f2fd;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.presence-icon {
		font-size: 1.25rem;
	}

	.presence-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1565c0;
	}

	.undiscovered-message {
		text-align: center;
		padding: 2.5rem 1.25rem;
		color: #999;
	}

	.undiscovered-message .icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.undiscovered-message p {
		margin: 0;
		font-size: 0.875rem;
	}

	.panel-actions {
		padding: 1rem 1.25rem;
		border-top: 2px solid #f0f0f0;
		display: flex;
		gap: 0.625rem;
		flex-wrap: wrap;
		background: #fafafa;
		flex-shrink: 0;
	}

	.action-button {
		flex: 1;
		min-width: 6.875rem;
		gap: 0.5rem;
		font-weight: 600;
	}

	.button-icon {
		font-size: 1rem;
	}

	/* Scrollbar styling */
	.panel-content::-webkit-scrollbar {
		width: 0.375rem;
	}

	.panel-content::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.panel-content::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 0.1875rem;
	}

	.panel-content::-webkit-scrollbar-thumb:hover {
		background: #555;
	}

	/* Tablet and up */
	@media (min-width: 768px) {
		.mobile-panel {
			display: none;
		}

		.desktop-panel {
			display: block;
		}
	}

	/* Small mobile adjustments */
	@media (max-width: 380px) {
		.drawer-content-wrapper {
			max-height: 80vh;
		}

		.point-name {
			font-size: 1rem;
		}

		.panel-header {
			padding: 0.875rem 1rem;
		}

		.panel-content {
			padding: 0.875rem 1rem;
		}

		.panel-actions {
			padding: 0.75rem 1rem;
			gap: 0.5rem;
		}

		.action-button {
			min-width: 5.625rem;
			font-size: 0.8125rem;
			padding: 0.5rem 0.75rem;
		}
	}

	/* Landscape mobile */
	@media (max-width: 768px) and (orientation: landscape) {
		.drawer-content-wrapper {
			max-height: 85vh;
		}

		.panel-content {
			max-height: 50vh;
		}
	}
</style>
