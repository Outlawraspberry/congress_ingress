<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
	import { Github } from '@lucide/svelte';
</script>

<div class="hero mt-8">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Welcome to Congress Quest</h1>
			<p class="my-6">
				Congress Quest is a capture the flag like game where you can claim points for one of two
				factions. Explore the congress, find small and hidden spots, play some mini games, and may
				meet new people.
			</p>

			The game is running until the end of the congress. You can find the current score on the
			<a href="/scoreboard" class="link"> scoreboard </a>.

			{#if user.user != null}
				<div class="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-center">
					<a href="/game/point" class="btn btn-primary btn-xl">Get Started</a>
					<a href="/scoreboard" class="btn btn-secondary btn-xl">View Scoreboard</a>
				</div>
			{:else}
				<p class="my-6">Before you can start, please</p>
				<div class="flex justify-center">
					<a href="/login" class="btn btn-primary btn-xl">Login</a>
					<div class="divider">OR</div>
					<a href="/register" class="btn btn-primary btn-xl">Register</a>
				</div>
			{/if}

			<div class="mt-8 flex max-w-md items-baseline justify-center gap-5">
				<p>Or checkout the project's source</p>
				<a href="https://github.com/Outlawraspberry/congress_ingress" class="btn btn-xl mt-4"
					>GitHub <Github /></a
				>
			</div>
		</div>
	</div>
</div>
