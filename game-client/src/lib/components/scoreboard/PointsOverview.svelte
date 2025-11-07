<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		ScoreboardService,
		type PointOverview,
		type PointHistory
	} from '$lib/supabase/scoreboard';

	let points: PointOverview[] = [];
	let loading = true;
	let error: string | null = null;
	let subscription: { unsubscribe: () => void } | null = null;
	let selectedPointId: string | null = null;
	let pointHistory: PointHistory[] = [];
	let historyLoading = false;

	async function loadPointsOverview() {
		try {
			loading = true;
			error = null;
			points = await ScoreboardService.getPointsOverview();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load points overview';
			console.error('Points overview error:', err);
		} finally {
			loading = false;
		}
	}

	async function loadPointHistory(pointId: string) {
		try {
			historyLoading = true;
			selectedPointId = pointId;
			pointHistory = await ScoreboardService.getPointHistory(pointId);
		} catch (err) {
			console.error('Point history error:', err);
			pointHistory = [];
		} finally {
			historyLoading = false;
		}
	}

	function formatDuration(durationString: string | null): string {
		if (!durationString) return 'N/A';

		// Parse PostgreSQL interval format
		const match = durationString.match(/(\d+):(\d+):(\d+)/);
		if (!match) return durationString;

		const [, hours, minutes] = match;
		const totalHours = parseInt(hours);
		const totalMinutes = parseInt(minutes);

		if (totalHours >= 24) {
			const days = Math.floor(totalHours / 24);
			const remainingHours = totalHours % 24;
			return `${days}d ${remainingHours}h`;
		} else if (totalHours > 0) {
			return `${totalHours}h ${totalMinutes}m`;
		} else if (totalMinutes > 0) {
			return `${totalMinutes}m`;
		} else {
			return 'Just claimed';
		}
	}

	function getHealthPercentage(current: number, max: number): number {
		return Math.round((current / max) * 100);
	}

	function getHealthColor(percentage: number): string {
		if (percentage >= 75) return 'progress-success';
		if (percentage >= 50) return 'progress-warning';
		if (percentage >= 25) return 'progress-error';
		return 'progress-error';
	}

	function closeHistoryModal() {
		selectedPointId = null;
		pointHistory = [];
	}

	onMount(async () => {
		await loadPointsOverview();

		// Subscribe to real-time point updates
		subscription = ScoreboardService.subscribeToPointUpdates(() => {
			loadPointsOverview(); // Refresh when points change ownership
		});
	});

	onDestroy(() => {
		if (subscription) {
			subscription.unsubscribe();
		}
	});
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title mb-4 text-2xl">
			🏭 Points Overview
			<div class="badge badge-secondary">Control Status</div>
		</h2>

		{#if loading}
			<div class="flex items-center justify-center py-8">
				<span class="loading loading-spinner loading-lg"></span>
				<span class="ml-3">Loading points overview...</span>
			</div>
		{:else if error}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
			</div>
		{:else if points.length === 0}
			<div class="py-8 text-center">
				<div class="mb-4 text-6xl">🏭</div>
				<h3 class="text-xl font-semibold">No Points Available</h3>
				<p class="text-base-content/70">No claimable points found in the system.</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table-zebra table">
					<thead>
						<tr>
							<th>Point Name</th>
							<th class="text-center">Health</th>
							<th>Controlled By</th>
							<th>Duration</th>
							<th class="text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each points as point (point.point_id)}
							<tr class="hover">
								<td>
									<div class="font-semibold">{point.point_name}</div>
								</td>
								<td class="text-center">
									<div class="w-full">
										<progress
											class="progress {getHealthColor(
												getHealthPercentage(point.current_health, point.max_health)
											)} w-16"
											value={point.current_health}
											max={point.max_health}
										></progress>
									</div>
									<div class="text-base-content/70 mt-1 text-xs">
										{point.current_health}/{point.max_health}
									</div>
								</td>
								<td>
									{#if point.current_faction_name}
										<div class="badge badge-outline">
											{point.current_faction_name}
										</div>
									{:else}
										<span class="text-base-content/50">Unclaimed</span>
									{/if}
								</td>
								<td class="text-base-content/70 text-sm">
									{formatDuration(point.current_claim_duration as string | null)}
								</td>
								<td class="text-center">
									<button
										class="btn btn-xs btn-ghost"
										on:click={() => loadPointHistory(point.point_id)}
									>
										📈 History
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="divider"></div>

			<div class="text-base-content/70 flex justify-between text-sm">
				<span>Updated in real-time</span>
				<button class="btn btn-sm btn-ghost" on:click={loadPointsOverview}> 🔄 Refresh </button>
			</div>
		{/if}
	</div>
</div>

<!-- Point History Modal -->
{#if selectedPointId && pointHistory.length > 0}
	<div class="modal modal-open">
		<div class="modal-box max-w-4xl">
			<h3 class="mb-4 text-lg font-bold">
				📈 Point History: {points.find((p) => p.point_id === selectedPointId)?.point_name}
			</h3>

			{#if historyLoading}
				<div class="flex items-center justify-center py-8">
					<span class="loading loading-spinner loading-lg"></span>
					<span class="ml-3">Loading history...</span>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table-zebra table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Faction</th>
								<th>Health</th>
								<th>Duration Held</th>
							</tr>
						</thead>
						<tbody>
							{#each pointHistory as entry (entry.created_at)}
								<tr>
									<td class="text-sm">
										{new Date(entry.created_at).toLocaleString()}
									</td>
									<td>
										<div class="badge badge-outline">
											{entry.faction_name}
										</div>
									</td>
									<td>{entry.health}</td>
									<td class="text-base-content/70 text-sm">
										{formatDuration(entry.duration_held as string | null)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<div class="modal-action">
				<button class="btn" on:click={closeHistoryModal}>Close</button>
			</div>
		</div>
	</div>
{/if}
