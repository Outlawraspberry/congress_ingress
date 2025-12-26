<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ScoreboardService, type ScoreboardUser } from '$lib/supabase/scoreboard';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';

	let users: ScoreboardUser[] = [];
	let loading = true;
	let error: string | null = null;
	let subscription: { unsubscribe: () => void } | null = null;

	// Pagination state
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalUsers = 0;

	$: totalPages = Math.ceil(totalUsers / itemsPerPage);
	$: startIndex = (currentPage - 1) * itemsPerPage;
	$: endIndex = Math.min(startIndex + itemsPerPage, totalUsers);
	$: canGoPrevious = currentPage > 1;
	$: canGoNext = currentPage < totalPages;

	async function loadScoreboard() {
		try {
			loading = true;
			error = null;
			// Load more users to support pagination
			const allUsers = await ScoreboardService.getTopUsersByExperience(100);
			users = allUsers;
			totalUsers = allUsers.length;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load scoreboard';
			console.error('Scoreboard error:', err);
		} finally {
			loading = false;
		}
	}

	function previousPage() {
		if (canGoPrevious) {
			currentPage--;
		}
	}

	function nextPage() {
		if (canGoNext) {
			currentPage++;
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
		const rank = startIndex + index + 1;
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	$: paginatedUsers = users.slice(startIndex, endIndex);

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
			<div class="badge badge-primary text-nowrap">Top {totalUsers}</div>
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
						{#each paginatedUsers as user, index (user.user_id)}
							<tr class="hover">
								<td class="text-center text-lg font-bold">
									{getRankDisplay(index)}
								</td>
								<td>
									<div class="font-semibold">{user.username}</div>
								</td>
								<td>
									{#if user.faction_name}
										<div class="badge badge-outline text-nowrap">
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

			<!-- Pagination Controls -->
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="text-base-content/70 text-sm">
					Showing {startIndex + 1}-{endIndex} of {totalUsers} players
				</div>

				<div class="flex items-center gap-2">
					<button class="btn btn-sm btn-ghost" on:click={loadScoreboard} disabled={loading}>
						🔄 Refresh
					</button>

					<div class="join">
						<button class="btn btn-sm join-item" on:click={previousPage} disabled={!canGoPrevious}>
							<ArrowLeft />
						</button>
						<button class="btn btn-sm join-item">
							Page {currentPage} of {totalPages}
						</button>
						<button class="btn btn-sm join-item" on:click={nextPage} disabled={!canGoNext}>
							<ArrowRight />
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
