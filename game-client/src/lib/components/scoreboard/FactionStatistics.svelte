<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ScoreboardService, type FactionStatistics } from '$lib/supabase/scoreboard';

	let factions: FactionStatistics[] = [];
	let loading = true;
	let error: string | null = null;
	let subscription: { unsubscribe: () => void } | null = null;

	async function loadFactionStats() {
		try {
			loading = true;
			error = null;
			factions = await ScoreboardService.getFactionStatistics();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load faction statistics';
			console.error('Faction stats error:', err);
		} finally {
			loading = false;
		}
	}

	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	function getFactionRankIcon(index: number): string {
		if (index === 0) return '👑';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return '🏴';
	}

	onMount(async () => {
		await loadFactionStats();

		// Subscribe to real-time updates
		subscription = ScoreboardService.subscribeToExperienceUpdates(() => {
			loadFactionStats();
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
			🏴 Faction Statistics
			<div class="badge badge-accent text-nowrap">Dominance</div>
		</h2>

		{#if loading}
			<div class="flex items-center justify-center py-8">
				<span class="loading loading-spinner loading-lg"></span>
				<span class="ml-3">Loading faction statistics...</span>
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
		{:else if factions.length === 0}
			<div class="py-8 text-center">
				<div class="mb-4 text-6xl">🏴</div>
				<h3 class="text-xl font-semibold">No Factions</h3>
				<p class="text-base-content/70">No factions found in the system.</p>
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each factions as faction, index (faction.faction_id)}
					<div class="card bg-base-200 shadow-sm">
						<div class="card-body">
							<div class="card-title text-lg">
								<span class="text-2xl">{getFactionRankIcon(index)}</span>
								{faction.faction_name}
							</div>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-base-content/70 text-sm">Members:</span>
									<span class="font-semibold">{formatNumber(faction.total_members)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-base-content/70 text-sm">Total XP:</span>
									<span class="font-semibold">{formatNumber(faction.total_experience)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-base-content/70 text-sm">Avg XP:</span>
									<span class="font-semibold"
										>{Math.round(faction.average_experience).toLocaleString()}</span
									>
								</div>
								<div class="flex justify-between">
									<span class="text-base-content/70 text-sm">Points:</span>
									<span class="font-semibold">{formatNumber(faction.points_controlled)}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-base-content/70 text-sm">Claims:</span>
									<span class="font-semibold">{formatNumber(faction.total_historical_claims)}</span>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="divider"></div>

			<div class="text-base-content/70 flex justify-between text-sm">
				<span>Ranked by total experience</span>
				<button class="btn btn-sm btn-ghost" on:click={loadFactionStats}> 🔄 Refresh </button>
			</div>
		{/if}
	</div>
</div>
