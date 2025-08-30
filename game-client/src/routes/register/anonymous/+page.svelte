<script lang="ts">
	import { goto } from '$app/navigation';
	import { signInAnonymously, supabase } from '$lib/supabase/db.svelte';
	import { AuthError } from '@supabase/supabase-js';
	import { Label, Input, Checkbox, Button, Heading, A, P, Alert, Select } from 'flowbite-svelte';
	import { Register, Section } from 'flowbite-svelte-blocks';

	const { data }: { data: { factions: { value: string; name: string }[] } } = $props();

	let nickname = $state('');
	let faction = $state('');
	let usernameExists = $state(false);
	let errorMessage: AuthError | undefined = $state(undefined);

	async function doesUsernameExists(): Promise<boolean> {
		const { data, error } = await supabase.rpc('does_username_exists', {
			a_username: nickname
		});

		if (error != null) {
			throw error;
		}

		return data == true;
	}

	async function onCheckUsername(): Promise<void> {
		usernameExists = await doesUsernameExists();
	}

	async function onsubmit(): Promise<void> {
		try {
			await signInAnonymously(nickname, faction);
			goto('/');
		} catch (error) {
			if (error instanceof AuthError) {
				errorMessage = error;
			} else {
				throw error;
			}
		}
	}
</script>

<Section name="register">
	<Register href="/">
		{#snippet top()}{/snippet}
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form class="flex flex-col space-y-6" {onsubmit}>
				<Heading tag="h3">Create an account</Heading>
				<Label>
					<span>Nickname</span>
					<Input
						type="text"
						name="username"
						placeholder="aNickname<3"
						bind:value={nickname}
						onInput={onCheckUsername}
						required
					/>
				</Label>
				<Label>
					Select a faction
					<Select class="mt-2" items={data.factions} bind:value={faction} required />
				</Label>
				<div class="flex items-start">
					<Checkbox required>
						I accept the <A href="/">Terms and Conditions</A>
					</Checkbox>
				</div>

				<Button type="submit" class="w-full1" disabled={usernameExists}>Create an account</Button>
				<P>You want more stability, <A href="/register/anonymous">register with your email</A></P>
				<P>Already have an account? <A href="/">Login here</A></P>
			</form>

			{#if usernameExists}
				<Alert>The username "{nickname}" is already chosen. 🫣</Alert>
			{/if}

			{#if errorMessage}
				<Alert>{errorMessage.message}</Alert>
			{/if}
		</div>
	</Register>
</Section>
