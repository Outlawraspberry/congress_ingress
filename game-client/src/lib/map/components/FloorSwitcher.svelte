<script lang="ts">
	import { floors, currentFloorId, floorStats, switchFloor, isSwitchingFloor } from '../mapStore';

	let isExpanded = false;

	async function handleFloorChange(floorId: number) {
		if ($currentFloorId === floorId) return;
		await switchFloor(floorId);
		isExpanded = false;
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	$: currentFloorName = $floors.find((f) => f.id === $currentFloorId)?.name || 'Select Floor';
</script>

<div class="floor-switcher">
	<!-- Mobile: Compact Dropdown -->
	<div class="mobile-switcher dropdown dropdown-bottom">
		<button class="btn btn-sm btn-primary" disabled={$isSwitchingFloor}>
			<span class="floor-icon">🏢</span>
			<span class="floor-name">{currentFloorName}</span>
			<span class="arrow">▼</span>
		</button>
		<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] mt-2 w-72 p-2 shadow-xl">
			{#each $floors as floor (floor.id)}
				{@const stats = $floorStats.find((s) => s.floorId === floor.id)}
				{@const isActive = $currentFloorId === floor.id}

				<li>
					<button
						class="floor-item"
						class:active={isActive}
						on:click={() => handleFloorChange(floor.id)}
						disabled={$isSwitchingFloor}
					>
						<div class="floor-info">
							<span class="floor-item-name">{floor.name}</span>
							{#if floor.building_name}
								<span class="building-name">{floor.building_name}</span>
							{/if}
						</div>

						{#if stats}
							<div class="floor-stats">
								<div class="stat-badge">
									<span class="stat-label">Total:</span>
									<span class="stat-value">{stats.totalPoints}</span>
								</div>
								{#if stats.ownFactionPoints > 0}
									<div class="stat-badge stat-own">
										<span class="stat-value">{stats.ownFactionPoints}</span>
									</div>
								{/if}
								{#if stats.enemyPoints > 0}
									<div class="stat-badge stat-enemy">
										<span class="stat-value">{stats.enemyPoints}</span>
									</div>
								{/if}
								{#if stats.neutralPoints > 0}
									<div class="stat-badge stat-neutral">
										<span class="stat-value">{stats.neutralPoints}</span>
									</div>
								{/if}
							</div>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Desktop: Expandable Panel -->
	<div class="desktop-switcher" class:expanded={isExpanded}>
		<button
			class="current-floor btn btn-ghost bg-base-100 shadow-lg"
			on:click={toggleExpanded}
			disabled={$isSwitchingFloor}
		>
			<span class="floor-icon">🏢</span>
			<span class="floor-name">{currentFloorName}</span>
			<span class="arrow" class:rotated={isExpanded}>▼</span>
		</button>

		{#if isExpanded}
			<div class="floor-list card bg-base-100 shadow-xl">
				{#each $floors as floor (floor.id)}
					{@const stats = $floorStats.find((s) => s.floorId === floor.id)}
					{@const isActive = $currentFloorId === floor.id}

					<button
						class="floor-button"
						class:active={isActive}
						on:click={() => handleFloorChange(floor.id)}
						disabled={$isSwitchingFloor}
					>
						<div class="floor-info">
							<span class="floor-item-name">{floor.name}</span>
							{#if floor.building_name}
								<span class="building-name">{floor.building_name}</span>
							{/if}
						</div>

						{#if stats}
							<div class="floor-stats-desktop">
								<div class="stat-row">
									<span class="stat-label">Points:</span>
									<span class="stat-value">{stats.totalPoints}</span>
								</div>
								{#if stats.ownFactionPoints > 0}
									<div class="stat-row own">
										<span class="stat-label">Yours:</span>
										<span class="stat-value">{stats.ownFactionPoints}</span>
									</div>
								{/if}
								{#if stats.enemyPoints > 0}
									<div class="stat-row enemy">
										<span class="stat-label">Enemy:</span>
										<span class="stat-value">{stats.enemyPoints}</span>
									</div>
								{/if}
								{#if stats.neutralPoints > 0}
									<div class="stat-row neutral">
										<span class="stat-label">Neutral:</span>
										<span class="stat-value">{stats.neutralPoints}</span>
									</div>
								{/if}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.floor-switcher {
		position: absolute;
		top: 0.625rem;
		left: 0.625rem;
		z-index: 1000;
	}

	/* Mobile Switcher */
	.mobile-switcher {
		display: block;
	}

	.mobile-switcher .btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		min-height: 2.5rem;
		height: 2.5rem;
		padding: 0 0.875rem;
	}

	.floor-icon {
		font-size: 1.125rem;
	}

	.floor-name {
		font-size: 0.8125rem;
		max-width: 8rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow {
		font-size: 0.625rem;
		opacity: 0.7;
		transition: transform 0.2s;
	}

	.dropdown-content {
		max-height: calc(100vh - 5rem);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.floor-item {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		padding: 0.75rem;
		text-align: left;
	}

	.floor-item.active {
		background: hsl(var(--p) / 0.1);
		border-left: 3px solid hsl(var(--p));
	}

	.floor-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.floor-item-name {
		font-weight: 600;
		font-size: 0.875rem;
		color: hsl(var(--bc));
	}

	.building-name {
		font-size: 0.75rem;
		opacity: 0.6;
	}

	.floor-stats {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		font-size: 0.75rem;
	}

	.stat-badge {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.125rem 0.5rem;
		border-radius: 0.75rem;
		background: hsl(var(--b2));
		font-weight: 600;
	}

	.stat-badge.stat-own {
		background: hsl(var(--su) / 0.2);
		color: hsl(var(--su));
	}

	.stat-badge.stat-enemy {
		background: hsl(var(--er) / 0.2);
		color: hsl(var(--er));
	}

	.stat-badge.stat-neutral {
		background: hsl(var(--b3));
		color: hsl(var(--bc) / 0.6);
	}

	.stat-label {
		font-weight: 500;
		opacity: 0.7;
		font-size: 0.6875rem;
	}

	.stat-value {
		font-weight: 700;
	}

	/* Desktop Switcher */
	.desktop-switcher {
		display: none;
		min-width: 12.5rem;
		max-width: 18.75rem;
	}

	.current-floor {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
		font-weight: 600;
		justify-content: space-between;
	}

	.current-floor:hover:not(:disabled) {
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		transform: translateY(-1px);
	}

	.current-floor:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.current-floor .floor-name {
		flex: 1;
		text-align: left;
		max-width: none;
	}

	.arrow.rotated {
		transform: rotate(180deg);
	}

	.floor-list {
		margin-top: 0.5rem;
		overflow: hidden;
		animation: slideDown 0.2s ease-out;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-0.625rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.floor-button {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		border-bottom: 1px solid hsl(var(--b2));
		background: white;
		cursor: pointer;
		transition: background 0.2s;
		text-align: left;
	}

	.floor-button:last-child {
		border-bottom: none;
	}

	.floor-button:hover:not(:disabled) {
		background: hsl(var(--b2));
	}

	.floor-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.floor-button.active {
		background: hsl(var(--su) / 0.1);
		border-left: 4px solid hsl(var(--su));
		padding-left: 0.75rem;
	}

	.floor-button.active:hover {
		background: hsl(var(--su) / 0.1);
	}

	.floor-button .floor-info {
		margin-bottom: 0.5rem;
	}

	.floor-stats-desktop {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.125rem 0;
	}

	.stat-row .stat-label {
		font-weight: 500;
		opacity: 0.7;
	}

	.stat-row .stat-value {
		font-weight: 600;
	}

	.stat-row.own .stat-value {
		color: hsl(var(--su));
	}

	.stat-row.enemy .stat-value {
		color: hsl(var(--er));
	}

	.stat-row.neutral .stat-value {
		opacity: 0.6;
	}

	/* Tablet and up */
	@media (min-width: 768px) {
		.mobile-switcher {
			display: none;
		}

		.desktop-switcher {
			display: block;
		}

		.floor-switcher {
			top: 1.25rem;
			left: 1.25rem;
		}
	}

	/* Small mobile adjustments */
	@media (max-width: 380px) {
		.floor-name {
			max-width: 6rem;
		}

		.dropdown-content {
			width: calc(100vw - 2rem);
		}
	}

	/* Scrollbar for desktop */
	.floor-list::-webkit-scrollbar,
	.dropdown-content::-webkit-scrollbar {
		width: 0.375rem;
	}

	.floor-list::-webkit-scrollbar-track,
	.dropdown-content::-webkit-scrollbar-track {
		background: hsl(var(--b2));
	}

	.floor-list::-webkit-scrollbar-thumb,
	.dropdown-content::-webkit-scrollbar-thumb {
		background: hsl(var(--bc) / 0.3);
		border-radius: 0.1875rem;
	}

	.floor-list::-webkit-scrollbar-thumb:hover,
	.dropdown-content::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--bc) / 0.5);
	}
</style>
