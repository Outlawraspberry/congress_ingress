<script lang="ts">
	let isExpanded = true;

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<div class="legend" class:collapsed={!isExpanded}>
	<button class="legend-toggle" on:click={toggleExpanded}>
		<span class="legend-title">
			{#if isExpanded}
				Legend
			{:else}
				?
			{/if}
		</span>
		<span class="toggle-icon" class:rotated={!isExpanded}>▼</span>
	</button>

	{#if isExpanded}
		<div class="legend-content">
			<!-- Faction Colors -->
			<div class="legend-section">
				<h4>Factions</h4>
				<div class="legend-item">
					<div class="color-marker own-faction"></div>
					<span>Your Faction</span>
				</div>
				<div class="legend-item">
					<div class="color-marker enemy-faction"></div>
					<span>Enemy Faction</span>
				</div>
				<div class="legend-item">
					<div class="color-marker neutral"></div>
					<span>Neutral</span>
				</div>
				<div class="legend-item">
					<div class="color-marker undiscovered"></div>
					<span>Undiscovered</span>
				</div>
			</div>

			<!-- Point Levels -->
			<div class="legend-section">
				<h4>Point Levels</h4>
				<div class="legend-item">
					<div class="size-marker level-1"></div>
					<span>Level 1</span>
				</div>
				<div class="legend-item">
					<div class="size-marker level-2"></div>
					<span>Level 2</span>
				</div>
				<div class="legend-item">
					<div class="size-marker level-3"></div>
					<span>Level 3</span>
				</div>
			</div>

			<!-- Point Types -->
			<div class="legend-section">
				<h4>Point Types</h4>
				<div class="legend-item">
					<span class="type-icon">🎯</span>
					<span>Claimable</span>
				</div>
				<div class="legend-item">
					<span class="type-icon">🎮</span>
					<span>Mini-game</span>
				</div>
			</div>

			<!-- Status Indicators -->
			<div class="legend-section">
				<h4>Status</h4>
				<div class="legend-item">
					<div class="status-indicator healthy"></div>
					<span>Healthy (&gt;75%)</span>
				</div>
				<div class="legend-item">
					<div class="status-indicator damaged"></div>
					<span>Damaged (25-75%)</span>
				</div>
				<div class="legend-item">
					<div class="status-indicator critical"></div>
					<span>Critical (&lt;25%)</span>
				</div>
			</div>

			<!-- Indicators -->
			<div class="legend-section">
				<h4>Indicators</h4>
				<div class="legend-item">
					<span class="indicator-badge">3</span>
					<span>Players Present</span>
				</div>
				<div class="legend-item">
					<div class="border-example selected"></div>
					<span>Selected</span>
				</div>
				<div class="legend-item">
					<div class="border-example contested"></div>
					<span>Contested</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.legend {
		position: absolute;
		bottom: 20px;
		left: 20px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		max-width: 220px;
		transition: all 0.3s;
	}

	.legend.collapsed {
		max-width: 60px;
	}

	.legend-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 12px 16px;
		background: none;
		border: none;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		color: #333;
		transition: background 0.2s;
	}

	.legend-toggle:hover {
		background: #f5f5f5;
	}

	.legend.collapsed .legend-toggle {
		justify-content: center;
	}

	.legend-title {
		flex: 1;
		text-align: left;
	}

	.toggle-icon {
		transition: transform 0.2s;
		font-size: 12px;
		color: #666;
	}

	.toggle-icon.rotated {
		transform: rotate(-90deg);
	}

	.legend-content {
		padding: 0 16px 16px;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.legend-section {
		margin-bottom: 16px;
	}

	.legend-section:last-child {
		margin-bottom: 0;
	}

	h4 {
		margin: 0 0 8px 0;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		color: #999;
		letter-spacing: 0.5px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
		font-size: 13px;
		color: #333;
	}

	.legend-item:last-child {
		margin-bottom: 0;
	}

	/* Color Markers */
	.color-marker {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid #333;
		flex-shrink: 0;
	}

	.color-marker.own-faction {
		background: #4caf50;
	}

	.color-marker.enemy-faction {
		background: #f44336;
	}

	.color-marker.neutral {
		background: #9e9e9e;
	}

	.color-marker.undiscovered {
		background: #e0e0e0;
	}

	/* Size Markers */
	.size-marker {
		border-radius: 50%;
		background: #4caf50;
		border: 2px solid #333;
		flex-shrink: 0;
	}

	.size-marker.level-1 {
		width: 16px;
		height: 16px;
	}

	.size-marker.level-2 {
		width: 24px;
		height: 24px;
	}

	.size-marker.level-3 {
		width: 32px;
		height: 32px;
	}

	/* Type Icons */
	.type-icon {
		font-size: 18px;
		flex-shrink: 0;
	}

	/* Status Indicators */
	.status-indicator {
		width: 40px;
		height: 6px;
		border-radius: 3px;
		flex-shrink: 0;
	}

	.status-indicator.healthy {
		background: #4caf50;
	}

	.status-indicator.damaged {
		background: #ff9800;
	}

	.status-indicator.critical {
		background: #f44336;
	}

	/* Indicator Badge */
	.indicator-badge {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #2196f3;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 700;
		flex-shrink: 0;
	}

	/* Border Examples */
	.border-example {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #4caf50;
		flex-shrink: 0;
	}

	.border-example.selected {
		border: 3px solid #ffd700;
	}

	.border-example.contested {
		border: 3px solid #ff9800;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.legend {
			bottom: 10px;
			left: 10px;
			max-width: 200px;
		}

		.legend.collapsed {
			max-width: 50px;
		}

		.legend-toggle {
			padding: 10px 12px;
			font-size: 13px;
		}

		.legend-content {
			padding: 0 12px 12px;
		}

		.legend-item {
			font-size: 12px;
			gap: 8px;
		}

		.color-marker,
		.size-marker.level-1 {
			width: 16px;
			height: 16px;
		}

		.size-marker.level-2 {
			width: 20px;
			height: 20px;
		}

		.size-marker.level-3 {
			width: 24px;
			height: 24px;
		}
	}
</style>
