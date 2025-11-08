<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
</script>

<div class="hero mt-8">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Welcome to Congress Quest</h1>
			<p class="my-6">
				Far far away, behind the word mountains, far from the countries Vokalia and Consonantia,
				there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the
				Semantics, a large language ocean. A small river named Duden flows by their place and
				supplies it with the necessary regelialia.
			</p>

			{#if user.user != null}
				<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
					<a href="/game/point" class="btn btn-primary btn-xl">Get Started</a>
					<a href="/scoreboard" class="btn btn-secondary btn-xl">View Scoreboard</a>
				</div>
			{:else}
				<p class="my-6">But first, please</p>
				<div class="flex justify-center">
					<a href="/login" class="btn btn-primary btn-xl">Login</a>
					<div class="divider">OR</div>
					<a href="/register" class="btn btn-primary btn-xl">Register</a>
				</div>
			{/if}
		</div>
	</div>
</div>
