<script lang="ts">
	import Claimable from '../../../routes/game/point/components/claimable.svelte';
	import Minigame from '../../../routes/game/point/components/minigame.svelte';
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

{#snippet content(point: MapPoint)}
	{#if point.type === 'claimable'}
		<Claimable />
	{:else if point.type === 'mini_game'}
		<Minigame />
	{/if}
{/snippet}

{#snippet contentHeader(point: MapPoint, visibility: PointVisibilityInfo)}
	<h2 class="inline text-2xl">
		{#if visibility.showName}
			{point.name}
		{:else}
			<span class="unknown">Unknown Point</span>
		{/if}
	</h2>
	<div class="inline">
		{point.type === 'claimable' ? '🎯 Claimable' : ''}
		{point.type === 'mini_game' ? '🎮 Mini-game' : ''}
		{point.type === 'not_claimable' ? '🚫 Not Claimable' : ''}
	</div>
{/snippet}

<dialog bind:this={dialog} {id} class="modal">
	<div class="modal-box">
		{@render contentHeader(point, visibility)}

		{@render content(point)}

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
