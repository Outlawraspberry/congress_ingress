<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
</script>

<div class="hero mt-8 min-h-screen">
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
				<a href="/game/point" class="btn btn-primary btn-xl">Get Started</a>
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
