<script lang="ts">
	import { user } from '../../supabase/user/user.svelte';
	import type { MapPoint, PointVisibilityInfo } from '../map.types';
	import { getHealthPercentage, getPointStatus, VisibilityReason } from '../map.types';
	import { formatTimeSinceUpdate } from '../mapStorage';
	import { discoveries, enemyCache, playerPresence } from '../mapStore';
	import { determinePointVisibility, getDisplayPointState } from '../visibilityRules';

	interface Props {
		id?: string;
		showCloseButton?: boolean;
		point: MapPoint;
		onOpen?: () => void;
		onClose?: () => void;
	}

	let { id = 'modal', showCloseButton = true, onOpen, onClose, point }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	// Expose methods via returned object
	export function open() {
		dialog?.showModal();
		onOpen?.();
	}

	export function close() {
		dialog?.close();
		onClose?.();
	}

	let isDiscovered = $derived(point && $discoveries ? $discoveries.has(point.id) : false);
	let cache = $derived(point && $enemyCache ? $enemyCache.get(point.id) || null : null);
	let visibility = $derived(
		point
			? determinePointVisibility(point, user.user?.faction || '', isDiscovered, cache)
			: {
					showLocation: false, // Show on map
					showName: false, // Show point name
					showDetails: false, // Show health, level, etc.
					showRealTime: false, // Show real-time updates
					reason: VisibilityReason.Undiscovered
				}
	);
	let displayState = $derived(
		point && visibility
			? getDisplayPointState(point, user.user?.faction || '', isDiscovered, cache)
			: null
	);
	let healthPercent = $derived(point ? getHealthPercentage(point) : 0);
	let status = $derived(point ? getPointStatus(point) : '');
	let presenceCount = $derived(point && $playerPresence ? $playerPresence.get(point.id) || 0 : 0);

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

<dialog bind:this={dialog} {id} class="modal">
	<div class="modal-box">
		{@render contentHeader(point, visibility)}

		{@render content(point, visibility)}

		<!-- Modal actions -->
		<div class="modal-action">
			{#if showCloseButton}
				<form method="dialog">
					<button class="btn">Close</button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Backdrop to close on click outside -->
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close modal">close</button>
	</form>
</dialog>
