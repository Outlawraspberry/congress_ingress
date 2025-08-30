<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import type { AuthError } from '@supabase/supabase-js';
	import { Label, Input, Checkbox, Button, Heading, A, P, Alert, Select } from 'flowbite-svelte';
	import { Register, Section } from 'flowbite-svelte-blocks';

	const { data }: { data: { factions: { value: string; name: string }[] } } = $props();

	console.log(data.factions);

	let nickname = $state('');
	let faction = $state('');
	let errorMessage: AuthError | undefined = $state(undefined);

	async function onsubmit(): Promise<void> {
		errorMessage = undefined;
		const { data, error } = await supabase.auth.signInAnonymously({
			options: {
				data: {
					display_name: nickname,
					faction_id: faction
				}
			}
		});

		if (error != null) {
			errorMessage = error;
		}

		console.log(data);
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
						required
					/>
				</Label>
				<Label>
					Select a faction
					<Select class="mt-2" items={data.factions} bind:value={faction} />
				</Label>
				<div class="flex items-start">
					<Checkbox>
						I accept the <A href="/">Terms and Conditions</A>
					</Checkbox>
				</div>
				<Button type="submit" class="w-full1">Create an account</Button>
				<P>You want more stability, <A href="/register/anonymous">register with your email</A></P>
				<P>Already have an account? <A href="/">Login here</A></P>
			</form>
		</div>
	</Register>

	{#if errorMessage}
		<Alert>{errorMessage.message}</Alert>
	{/if}
</Section>
