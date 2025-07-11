<script lang="ts">
	import type { AuthError } from '@supabase/supabase-js';
	import { signIn } from './db.svelte';

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
		<label>
			<span>E-mail Address</span>
			<input name="email" type="email" required bind:value={email} />
		</label>
		<label>
			<span>Password</span>
			<input name="password" type="password" required bind:value={password} />
		</label>
		<button>
			<svg
				class="icon"
				height="24"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
			<span>Send me a magic link</span>
		</button>
	</form>
	{#if error}
		{error.message}
	{/if}
</div>
