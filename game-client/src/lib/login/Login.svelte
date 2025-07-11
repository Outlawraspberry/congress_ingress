<script lang="ts">
	import type { AuthError } from '@supabase/supabase-js';
	import { signIn } from './db.svelte';
	import { Button, Input, Label } from 'flowbite-svelte';

	let email: string = $state('');
	let password: string = $state('');
	let error: AuthError | undefined = $state(undefined);

	async function submit(event: SubmitEvent) {
		event.preventDefault();

		try {
			error = undefined;
			await signIn(email, password);
		} catch (err) {
			error = err as AuthError;
		}
	}
</script>

<div class="container">
	<h1>Sign in</h1>

	<form onsubmit={submit}>
		<div class="mb-6">
			<Label for="email" class="mb-2">Email address</Label>
			<Input
				type="email"
				id="email"
				placeholder="john.doe@company.com"
				bind:value={email}
				required
			/>
		</div>
		<div class="mb-6">
			<Label for="password" class="mb-2">Password</Label>
			<Input type="password" id="password" placeholder="•••••••••" bind:value={password} required />
		</div>

		<Button type="submit">Login</Button>
	</form>
	{#if error}
		{error.message}
	{/if}
</div>
