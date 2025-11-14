<script lang="ts">
	import { floors, currentFloorId, floorStats, switchFloor, isLoading } from '../mapStore';

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

<div class="floor-switcher" class:expanded={isExpanded}>
	<button class="current-floor" on:click={toggleExpanded} disabled={$isLoading}>
		<span class="floor-icon">🏢</span>
		<span class="floor-name">{currentFloorName}</span>
		<span class="arrow" class:rotated={isExpanded}>▼</span>
	</button>

	{#if isExpanded}
		<div class="floor-list">
			{#each $floors as floor (floor.id)}
				{@const stats = $floorStats.find((s) => s.floorId === floor.id)}
				{@const isActive = $currentFloorId === floor.id}

				<button
					class="floor-button"
					class:active={isActive}
					on:click={() => handleFloorChange(floor.id)}
					disabled={$isLoading}
				>
					<div class="floor-info">
						<span class="floor-name">{floor.name}</span>
						{#if floor.building_name}
							<span class="building-name">{floor.building_name}</span>
						{/if}
					</div>

					{#if stats}
						<div class="floor-stats">
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

<style>
	.floor-switcher {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 1000;
		min-width: 200px;
		max-width: 300px;
	}

	.current-floor {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 12px 16px;
		background: white;
		border: none;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		transition: all 0.2s;
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	.current-floor:hover:not(:disabled) {
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		transform: translateY(-1px);
	}

	.current-floor:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.floor-icon {
		font-size: 20px;
	}

	.current-floor .floor-name {
		flex: 1;
		text-align: left;
	}

	.arrow {
		transition: transform 0.2s;
		font-size: 12px;
		color: #666;
	}

	.arrow.rotated {
		transform: rotate(180deg);
	}

	.floor-list {
		margin-top: 8px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
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
		padding: 12px 16px;
		border: none;
		border-bottom: 1px solid #f0f0f0;
		background: white;
		cursor: pointer;
		transition: background 0.2s;
		text-align: left;
	}

	.floor-button:last-child {
		border-bottom: none;
	}

	.floor-button:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.floor-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.floor-button.active {
		background: #e8f5e9;
		border-left: 4px solid #4caf50;
		padding-left: 12px;
	}

	.floor-button.active:hover {
		background: #e8f5e9;
	}

	.floor-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 8px;
	}

	.floor-button .floor-name {
		font-weight: 600;
		font-size: 14px;
		color: #333;
	}

	.building-name {
		font-size: 12px;
		color: #666;
	}

	.floor-stats {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2px 0;
	}

	.stat-label {
		color: #666;
		font-weight: 500;
	}

	.stat-value {
		font-weight: 600;
		color: #333;
	}

	.stat-row.own .stat-value {
		color: #4caf50;
	}

	.stat-row.enemy .stat-value {
		color: #f44336;
	}

	.stat-row.neutral .stat-value {
		color: #9e9e9e;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.floor-switcher {
			top: 10px;
			left: 10px;
			right: 10px;
			max-width: none;
		}

		.current-floor {
			padding: 10px 12px;
			font-size: 13px;
		}

		.floor-button {
			padding: 10px 12px;
		}
	}
</style>
