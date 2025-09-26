<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signIn } from '$lib/supabase/db.svelte';
	import type { AuthError } from '@supabase/supabase-js';
	import { A, Alert, Button, Heading, Input, Label, P } from 'flowbite-svelte';
	import { Register, Section } from 'flowbite-svelte-blocks';

	let wasRedirected = page.url.searchParams.has('wasRedirected');
	let { data }: { data: { redirectUrl: string } } = $props();

	let email: string = $state('');
	let password: string = $state('');
	let error: AuthError | undefined = $state(undefined);

	async function submit(event: SubmitEvent) {
		event.preventDefault();

		try {
			error = undefined;
			await signIn(email, password);

			goto(data.redirectUrl);
		} catch (err) {
			error = err as AuthError;
		}
	}
</script>

<section class="hero">
	<div class="hero-content flex-col">
		<h1 class="text-3xl font-bold">Login</h1>

		{#if wasRedirected}
			<div role="alert" class="alert alert-success">Please login before playing the game! 😊</div>
		{/if}

		<form onsubmit={submit}>
			<fieldset
				class="fieldset rounded-box dark:bg-base-100 bg-base-200 w-full p-4 sm:w-md"
				onsubmit={submit}
			>
				<label for="input-email" class="label">Email</label>
				<input
					id="input-email"
					type="email"
					class="input w-full"
					placeholder="Email"
					autocomplete="on"
					bind:value={email}
					required
				/>

				<label for="input-password" class="label">Password</label>
				<input
					id="input-password"
					type="password"
					class="input w-full"
					placeholder="Password"
					bind:value={password}
					required
				/>

				<input type="submit" class="btn btn-primary mt-4" value="Login" />

				<p class="mt-3">
					Have you forget your password. <a href="/" class="text-primary font-bold"
						>No problem, just reset it?</a
					>
				</p>

				<p class="mt-3">
					Don’t have an account yet? <a href="/register" class="text-primary font-bold">
						Sign up
					</a>
				</p>
			</fieldset>

			{#if error}
				<div role="alert" class="alert alert-error">{error.message}</div>
			{/if}
		</form>
	</div>
</section>
