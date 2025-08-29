<script lang="ts">
	import type { AuthError } from '@supabase/supabase-js';
	import { A, Alert, Button, Heading, Input, Label, P } from 'flowbite-svelte';
	import { Register, Section } from 'flowbite-svelte-blocks';
	import { signIn } from '../supabase/db.svelte';

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

<Section name="login">
	<Register href="/">
		{#snippet top()}{/snippet}
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form class="flex flex-col space-y-6" onsubmit={submit}>
				<Heading tag="h3">Change Password</Heading>
				<Label class="space-y-2">
					<span>Your email</span>
					<Input
						type="email"
						name="email"
						placeholder="name@company.com"
						bind:value={email}
						required
					/>
				</Label>
				<Label class="space-y-2">
					<span>Your password</span>
					<Input
						type="password"
						name="password"
						placeholder="•••••"
						bind:value={password}
						required
					/>
				</Label>
				<Button type="submit" class="w-full1">Sign in</Button>
				<P>Have you forget your password. <A href="/">No problem, just reset it?</A></P>

				<P>
					Don’t have an account yet? <A
						href="/register"
						class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Sign up</A
					>
				</P>
			</form>
			{#if error}
				<Alert>{error.message}</Alert>
			{/if}
		</div>
	</Register>
</Section>
