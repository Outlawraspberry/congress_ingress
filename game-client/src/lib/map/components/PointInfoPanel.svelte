<script lang="ts">
	import type { MapPoint } from '../map.types';
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

	$: userFactionId = user.user?.faction || '';
	$: isDiscovered = point ? $discoveries.has(point.id) : false;
	$: cache = point ? $enemyCache.get(point.id) || null : null;
	$: visibility = point
		? determinePointVisibility(point, userFactionId, isDiscovered, cache)
		: null;
	$: displayState =
		point && visibility ? getDisplayPointState(point, userFactionId, isDiscovered, cache) : null;
	$: healthPercent = point ? getHealthPercentage(point) : 0;
	$: status = point ? getPointStatus(point) : '';
	$: presenceCount = point ? $playerPresence.get(point.id) || 0 : 0;

	function handleClose() {
		dispatch('close');
	}

	function handleNavigate() {
		if (point) {
			dispatch('navigate', { pointId: point.id });
		}
	}

	function handleAction(actionType: string) {
		if (point) {
			dispatch('action', { pointId: point.id, actionType });
		}
	}

	function getFactionBadgeColor(factionId: string | null): string {
		if (factionId === null) return '#9E9E9E';
		if (factionId === userFactionId) return '#4CAF50';
		return '#f44336';
	}
</script>

{#if point && visibility}
	<div
		class="panel-overlay"
		on:click={handleClose}
		on:keydown={handleClose}
		role="button"
		tabindex="0"
	></div>
	<div class="panel">
		<div class="panel-header">
			<div class="header-content">
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
				</div>
			</div>
			<button class="close-button" on:click={handleClose} aria-label="Close">×</button>
		</div>

		<div class="panel-content">
			{#if visibility.showDetails && displayState}
				<!-- Faction Ownership -->
				{#if point.type === 'claimable'}
					<div class="info-section">
						<div class="section-title">Ownership</div>
						<div
							class="faction-badge"
							style="background: {getFactionBadgeColor(displayState.factionId)}"
						>
							{#if displayState.factionId === null}
								Neutral
							{:else if displayState.factionId === userFactionId}
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
							<span class="level-badge">Lv. {displayState.level}</span>
						</span>
					</div>

					<!-- Health -->
					<div class="info-section">
						<div class="info-row">
							<span class="label">Health:</span>
							<span class="value">
								{displayState.health} / {displayState.maxHealth}
								<span
									class="status-badge"
									class:healthy={healthPercent > 75}
									class:damaged={healthPercent <= 75 && healthPercent > 25}
									class:critical={healthPercent <= 25}
								>
									{status}
								</span>
							</span>
						</div>

						<!-- Health Bar -->
						<div class="health-bar-container">
							<div class="health-bar">
								<div
									class="health-fill"
									class:healthy={healthPercent > 75}
									class:damaged={healthPercent <= 75 && healthPercent > 25}
									class:critical={healthPercent <= 25}
									style="width: {healthPercent}%"
								></div>
							</div>
							<span class="health-percent">{Math.round(healthPercent)}%</span>
						</div>
					</div>

					<!-- Cache Status / Real-time Indicator -->
					{#if displayState.isCached && displayState.lastUpdated}
						<div class="cache-warning">
							<span class="icon">⚠️</span>
							<div class="warning-content">
								<div class="warning-title">Cached Information</div>
								<div class="warning-text">
									Last updated: {formatTimeSinceUpdate(displayState.lastUpdated)}
								</div>
							</div>
						</div>
					{:else if visibility.showRealTime}
						<div class="realtime-indicator">
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
			{/if}
		</div>

		<!-- Actions -->
		<div class="panel-actions">
			<button class="action-button navigate" on:click={handleNavigate}>
				<span class="button-icon">🧭</span>
				Navigate
			</button>

			{#if visibility.showDetails && point.type === 'claimable'}
				<!-- Add action buttons based on point state -->
				{#if displayState && displayState.factionId === userFactionId}
					<button class="action-button repair" on:click={() => handleAction('repair')}>
						<span class="button-icon">🔧</span>
						Repair
					</button>
					<button class="action-button upgrade" on:click={() => handleAction('upgrade')}>
						<span class="button-icon">⬆️</span>
						Upgrade
					</button>
				{:else if displayState && displayState.factionId !== userFactionId}
					<button class="action-button attack" on:click={() => handleAction('attack')}>
						<span class="button-icon">⚔️</span>
						Attack
					</button>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
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
		right: 20px;
		top: 20px;
		bottom: 20px;
		width: 350px;
		max-height: calc(100vh - 40px);
		background: white;
		border-radius: 12px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
		z-index: 2000;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(20px);
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
		padding: 20px;
		border-bottom: 2px solid #f0f0f0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.header-content {
		flex: 1;
	}

	.point-name {
		margin: 0 0 8px 0;
		font-size: 20px;
		font-weight: 700;
	}

	.unknown {
		opacity: 0.8;
		font-style: italic;
	}

	.point-type-badge {
		display: inline-block;
		padding: 4px 12px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.point-type-badge.mini-game {
		background: rgba(255, 215, 0, 0.3);
	}

	.close-button {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		font-size: 32px;
		cursor: pointer;
		padding: 0;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: white;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: rotate(90deg);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.info-section {
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: #999;
		margin-bottom: 8px;
		letter-spacing: 0.5px;
	}

	.faction-badge {
		display: inline-block;
		padding: 8px 16px;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		font-size: 14px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.info-row.small {
		font-size: 12px;
		color: #999;
		margin-bottom: 8px;
	}

	.label {
		font-weight: 600;
		color: #666;
	}

	.value {
		color: #333;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.level-badge {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 4px 10px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 700;
	}

	.status-badge {
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-badge.healthy {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.status-badge.damaged {
		background: #fff3e0;
		color: #e65100;
	}

	.status-badge.critical {
		background: #ffebee;
		color: #c62828;
	}

	.health-bar-container {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}

	.health-bar {
		flex: 1;
		height: 24px;
		background: #e0e0e0;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.health-fill {
		height: 100%;
		transition: width 0.5s ease;
		border-radius: 12px;
	}

	.health-fill.healthy {
		background: linear-gradient(90deg, #4caf50, #8bc34a);
	}

	.health-fill.damaged {
		background: linear-gradient(90deg, #ff9800, #ffc107);
	}

	.health-fill.critical {
		background: linear-gradient(90deg, #f44336, #e91e63);
	}

	.health-percent {
		font-size: 14px;
		font-weight: 700;
		color: #666;
		min-width: 45px;
		text-align: right;
	}

	.cache-warning {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px;
		background: #fff3cd;
		border: 1px solid #ffc107;
		border-radius: 8px;
		margin-top: 16px;
	}

	.cache-warning .icon {
		font-size: 20px;
	}

	.warning-content {
		flex: 1;
	}

	.warning-title {
		font-weight: 600;
		font-size: 13px;
		color: #856404;
		margin-bottom: 2px;
	}

	.warning-text {
		font-size: 12px;
		color: #856404;
	}

	.realtime-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: #e8f5e9;
		border: 1px solid #4caf50;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		color: #2e7d32;
		margin-top: 16px;
	}

	.pulse {
		width: 8px;
		height: 8px;
		background: #4caf50;
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
		gap: 10px;
		padding: 12px;
		background: #e3f2fd;
		border-radius: 8px;
		margin-bottom: 16px;
	}

	.presence-icon {
		font-size: 20px;
	}

	.presence-text {
		font-size: 14px;
		font-weight: 600;
		color: #1565c0;
	}

	.undiscovered-message {
		text-align: center;
		padding: 40px 20px;
		color: #999;
	}

	.undiscovered-message .icon {
		font-size: 48px;
		display: block;
		margin-bottom: 16px;
	}

	.undiscovered-message p {
		margin: 0;
		font-size: 14px;
	}

	.panel-actions {
		padding: 16px 20px;
		border-top: 2px solid #f0f0f0;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		background: #fafafa;
	}

	.action-button {
		flex: 1;
		min-width: 120px;
		padding: 12px 16px;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.action-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.action-button.navigate {
		background: #2196f3;
		color: white;
	}

	.action-button.navigate:hover {
		background: #1976d2;
	}

	.action-button.repair {
		background: #4caf50;
		color: white;
	}

	.action-button.repair:hover {
		background: #388e3c;
	}

	.action-button.attack {
		background: #f44336;
		color: white;
	}

	.action-button.attack:hover {
		background: #d32f2f;
	}

	.action-button.upgrade {
		background: #ff9800;
		color: white;
	}

	.action-button.upgrade:hover {
		background: #f57c00;
	}

	.button-icon {
		font-size: 16px;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.panel {
			right: 10px;
			top: 10px;
			bottom: 10px;
			width: calc(100% - 20px);
			max-width: 400px;
		}

		.panel-header {
			padding: 16px;
		}

		.point-name {
			font-size: 18px;
		}

		.panel-content {
			padding: 16px;
		}

		.panel-actions {
			padding: 12px 16px;
		}

		.action-button {
			min-width: 100px;
			padding: 10px 12px;
			font-size: 13px;
		}
	}

	/* Scrollbar styling */
	.panel-content::-webkit-scrollbar {
		width: 6px;
	}

	.panel-content::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	.panel-content::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 3px;
	}

	.panel-content::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
