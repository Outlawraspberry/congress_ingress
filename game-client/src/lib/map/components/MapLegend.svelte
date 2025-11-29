<script lang="ts">
	let isExpanded = false;
	let showMobileModal = false;

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	function toggleMobileModal() {
		showMobileModal = !showMobileModal;
	}
</script>

<!-- Mobile: Floating Button + Modal -->
<div class="mobile-legend">
	<button class="btn btn-circle btn-primary legend-fab" on:click={toggleMobileModal}>
		<span class="fab-icon">?</span>
	</button>

	{#if showMobileModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-sm">
				<button
					class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
					on:click={toggleMobileModal}>✕</button
				>
				<h3 class="mb-4 text-lg font-bold">Map Legend</h3>

				<div class="legend-content-mobile">
					<!-- Faction Colors -->
					<div class="legend-section">
						<h4 class="legend-section-title">Factions</h4>
						<div class="legend-grid">
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
					</div>

					<!-- Point Levels -->
					<div class="legend-section">
						<h4 class="legend-section-title">Point Levels</h4>
						<div class="legend-grid">
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
					</div>

					<!-- Point Types -->
					<div class="legend-section">
						<h4 class="legend-section-title">Point Types</h4>
						<div class="legend-grid">
							<div class="legend-item">
								<span class="type-icon">🎯</span>
								<span>Claimable</span>
							</div>
							<div class="legend-item">
								<span class="type-icon">🎮</span>
								<span>Mini-game</span>
							</div>
						</div>
					</div>

					<!-- Status Indicators -->
					<div class="legend-section">
						<h4 class="legend-section-title">Health Status</h4>
						<div class="legend-grid">
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
					</div>

					<!-- Indicators -->
					<div class="legend-section">
						<h4 class="legend-section-title">Indicators</h4>
						<div class="legend-grid">
							<div class="legend-item">
								<span class="indicator-badge">3</span>
								<span>Players Present</span>
							</div>
							<div class="legend-item">
								<div class="border-example selected"></div>
								<span>Selected Point</span>
							</div>
							<div class="legend-item">
								<div class="border-example contested"></div>
								<span>Contested</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				role="button"
				tabindex="0"
				class="modal-backdrop"
				on:click={toggleMobileModal}
				on:keydown={toggleMobileModal}
			></div>
		</div>
	{/if}
</div>

<!-- Desktop: Collapsible Panel -->
<div class="desktop-legend card bg-base-100 shadow-xl" class:collapsed={!isExpanded}>
	<button class="legend-toggle btn btn-ghost" on:click={toggleExpanded}>
		<span class="legend-title">
			{#if isExpanded}
				Legend
			{:else}
				<span class="collapsed-icon">?</span>
			{/if}
		</span>
		{#if isExpanded}
			<span class="toggle-icon" class:rotated={!isExpanded}>▼</span>
		{/if}
	</button>

	{#if isExpanded}
		<div class="legend-content">
			<!-- Faction Colors -->
			<div class="legend-section">
				<h4 class="legend-section-title">Factions</h4>
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
				<h4 class="legend-section-title">Point Levels</h4>
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
				<h4 class="legend-section-title">Point Types</h4>
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
				<h4 class="legend-section-title">Health Status</h4>
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
				<h4 class="legend-section-title">Indicators</h4>
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
	/* Mobile Legend - FAB + Modal */
	.mobile-legend {
		display: block;
	}

	.legend-fab {
		position: fixed;
		bottom: 5rem;
		left: 1.25rem;
		z-index: 999;
		width: 3.5rem;
		height: 3.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	}

	.fab-icon {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.legend-content-mobile {
		max-height: calc(100vh - 12rem);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.legend-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	/* Desktop Legend - Collapsible Panel */
	.desktop-legend {
		display: none;
		position: absolute;
		bottom: 1.25rem;
		left: 1.25rem;
		z-index: 1000;
		max-width: 13.75rem;
		transition: all 0.3s;
	}

	.desktop-legend.collapsed {
		max-width: 3.75rem;
	}

	.legend-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.75rem 1rem;
		font-weight: 600;
		font-size: 0.875rem;
		transition: background 0.2s;
	}

	.legend-toggle:hover {
		background: hsl(var(--b2));
	}

	.desktop-legend.collapsed .legend-toggle {
		justify-content: center;
		padding: 0.75rem;
	}

	.legend-title {
		flex: 1;
		text-align: left;
	}

	.collapsed-icon {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.toggle-icon {
		transition: transform 0.2s;
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.toggle-icon.rotated {
		transform: rotate(-90deg);
	}

	.legend-content {
		padding: 0 1rem 1rem;
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
		margin-bottom: 1rem;
	}

	.legend-section:last-child {
		margin-bottom: 0;
	}

	.legend-section-title {
		margin: 0 0 0.5rem 0;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		opacity: 0.6;
		letter-spacing: 0.03125rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-bottom: 0.5rem;
		font-size: 0.8125rem;
	}

	.legend-item:last-child {
		margin-bottom: 0;
	}

	/* Color Markers */
	.color-marker {
		width: 1.25rem;
		height: 1.25rem;
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
		width: 1rem;
		height: 1rem;
	}

	.size-marker.level-2 {
		width: 1.5rem;
		height: 1.5rem;
	}

	.size-marker.level-3 {
		width: 2rem;
		height: 2rem;
	}

	/* Type Icons */
	.type-icon {
		font-size: 1.125rem;
		flex-shrink: 0;
	}

	/* Status Indicators */
	.status-indicator {
		width: 2.5rem;
		height: 0.375rem;
		border-radius: 0.1875rem;
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
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: #2196f3;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6875rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	/* Border Examples */
	.border-example {
		width: 1.25rem;
		height: 1.25rem;
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

	/* Tablet and up */
	@media (min-width: 768px) {
		.mobile-legend {
			display: none;
		}

		.desktop-legend {
			display: block;
		}
	}

	/* Small mobile adjustments */
	@media (max-width: 380px) {
		.legend-fab {
			width: 3rem;
			height: 3rem;
			bottom: 1rem;
			right: 1rem;
		}

		.fab-icon {
			font-size: 1.25rem;
		}

		.legend-grid {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.legend-item {
			font-size: 0.75rem;
			gap: 0.5rem;
		}
	}

	/* Scrollbar styling */
	.legend-content::-webkit-scrollbar,
	.legend-content-mobile::-webkit-scrollbar {
		width: 0.375rem;
	}

	.legend-content::-webkit-scrollbar-track,
	.legend-content-mobile::-webkit-scrollbar-track {
		background: hsl(var(--b2));
	}

	.legend-content::-webkit-scrollbar-thumb,
	.legend-content-mobile::-webkit-scrollbar-thumb {
		background: hsl(var(--bc) / 0.3);
		border-radius: 0.1875rem;
	}

	.legend-content::-webkit-scrollbar-thumb:hover,
	.legend-content-mobile::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--bc) / 0.5);
	}

	/* Ensure modal is above everything */
	:global(.modal) {
		z-index: 9999 !important;
	}
</style>
