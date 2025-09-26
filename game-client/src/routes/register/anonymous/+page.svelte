<script lang="ts">
	import { goto } from '$app/navigation';
	import Fieldset from '$lib/components/form/fieldset.svelte';
	import { signInAnonymously, supabase } from '$lib/supabase/db.svelte';
	import { AuthError } from '@supabase/supabase-js';

	const { data }: { data: { factions: { value: string; name: string }[] } } = $props();

	let nickname = $state('');
	let faction: string | undefined = $state(undefined);
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
		if (faction == null) return;
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

<section class="hero">
	<div class="hero-content flex-col">
		<h1 class="text-3xl font-bold">Login</h1>

		<form {onsubmit}>
			<Fieldset>
				<label for="input-username" class="label">Username</label>
				<input
					id="input-username"
					type="text"
					class="input w-full"
					placeholder="aNickname<3"
					autocomplete="on"
					bind:value={nickname}
					oninput={onCheckUsername}
					required
				/>

				<label for="input-faction" class="label">Select a faction</label>

				<select class="select" id="input-faction" bind:value={faction} required>
					<option disabled selected>Pick a faction</option>
					{#each data.factions as faction (faction.value)}
						<option value={faction.value}>{faction.name}</option>
					{/each}
				</select>

				<input type="submit" class="btn btn-primary mt-4" value="Create an account" />

				<p class="mt-3">
					You want more stability, <a class="text-primary font-bold" href="/register/email"
						>register with your email</a
					>
				</p>
				<p class="mt-3">
					Already have an account? <a class="text-primary font-bold" href="/login">Login here</a>
				</p>
			</Fieldset>

			{#if usernameExists}
				<div role="alert" class="alert alert-error">
					The username "{nickname}" is already chosen. 🫣
				</div>
			{/if}

			{#if errorMessage}
				<div role="alert" class="alert alert-error">{errorMessage.message}</div>
			{/if}
		</form>
	</div>
</section>
