<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ScoreboardService, type ScoreboardUser } from '$lib/supabase/scoreboard';

	let users: ScoreboardUser[] = [];
	let loading = true;
	let error: string | null = null;
	let subscription: { unsubscribe: () => void } | null = null;

	async function loadScoreboard() {
		try {
			loading = true;
			error = null;
			users = await ScoreboardService.getTopUsersByExperience(10);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load scoreboard';
			console.error('Scoreboard error:', err);
		} finally {
			loading = false;
		}
	}

	function formatDuration(lastAction: string | null): string {
		if (!lastAction) return 'Never';

		const now = new Date();
		const actionDate = new Date(lastAction);
		const diffMs = now.getTime() - actionDate.getTime();

		const minutes = Math.floor(diffMs / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return 'Just now';
	}

	function getRankDisplay(index: number): string {
		const rank = index + 1;
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	onMount(async () => {
		await loadScoreboard();

		// Subscribe to real-time experience updates
		subscription = ScoreboardService.subscribeToExperienceUpdates(() => {
			loadScoreboard(); // Refresh scoreboard when experience changes
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
			🏆 Global Scoreboard
			<div class="badge badge-primary">Top 10</div>
		</h2>

		{#if loading}
			<div class="flex items-center justify-center py-8">
				<span class="loading loading-spinner loading-lg"></span>
				<span class="ml-3">Loading scoreboard...</span>
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
		{:else if users.length === 0}
			<div class="py-8 text-center">
				<div class="mb-4 text-6xl">🎯</div>
				<h3 class="text-xl font-semibold">No Players Yet</h3>
				<p class="text-base-content/70">Be the first to gain experience!</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table-zebra table">
					<thead>
						<tr>
							<th class="text-center">Rank</th>
							<th>Player</th>
							<th>Faction</th>
							<th class="text-right">Experience</th>
							<th>Last Action</th>
						</tr>
					</thead>
					<tbody>
						{#each users as user, index (user.user_id)}
							<tr class="hover">
								<td class="text-center text-lg font-bold">
									{getRankDisplay(index)}
								</td>
								<td>
									<div class="font-semibold">{user.username}</div>
								</td>
								<td>
									{#if user.faction_name}
										<div class="badge badge-outline">
											{user.faction_name}
										</div>
									{:else}
										<span class="text-base-content/50">No faction</span>
									{/if}
								</td>
								<td class="text-right font-mono font-bold">
									{user.experience.toLocaleString()} XP
								</td>
								<td class="text-base-content/70 text-sm">
									{formatDuration(user.last_action)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="divider"></div>

			<div class="text-base-content/70 flex justify-between text-sm">
				<span>Updated in real-time</span>
				<button class="btn btn-sm btn-ghost" on:click={loadScoreboard}> 🔄 Refresh </button>
			</div>
		{/if}
	</div>
</div>
