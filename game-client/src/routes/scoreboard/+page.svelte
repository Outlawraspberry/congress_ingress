<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import { goto } from '$app/navigation';
	import UserScoreboard from '$lib/components/scoreboard/UserScoreboard.svelte';
	import PointsOverview from '$lib/components/scoreboard/PointsOverview.svelte';
	import FactionStatistics from '$lib/components/scoreboard/FactionStatistics.svelte';
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';

	onMount(() => {
		// Redirect to login if not authenticated
		if (!user.user) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Scoreboard - Congress Quest</title>
	<meta
		name="description"
		content="View the global scoreboard and points overview for Congress Quest"
	/>
</svelte:head>

<div class="container mx-auto px-4 py-6">
	<h1 class="text-3xl">📊 Scoreboard</h1>
	<h2 class="text-left">
		Track player rankings, point control, and faction dominance in real-time
	</h2>

	<Breadcrump />

	<div class="flex flex-col gap-6 xl:flex-row">
		<!-- User Scoreboard Section -->
		<div class="flex-1">
			<UserScoreboard />
		</div>

		<!-- Points Overview Section -->
		<div class="flex-1">
			<PointsOverview />
		</div>
	</div>

	<!-- Faction Statistics Section -->
	<div class="mt-8">
		<FactionStatistics />
	</div>

	<!-- Navigation Back -->
	<div class="mt-8 text-center">
		<a href="/game/point" class="btn btn-primary"> ← Back to Game </a>
	</div>
</div>
