<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	import Fieldset from '$lib/components/form/fieldset.svelte';
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import type { AuthError } from '@supabase/supabase-js';

	let email: string = $state('');
	let password: string = $state('');
	let wasSusccessfull: boolean | null = $state(null);
	let error: AuthError | undefined = $state(undefined);

	async function submit(event: SubmitEvent) {
		event.preventDefault();

		try {
			error = undefined;

			const { data: updateEmailData, error: updateEmailError } = await supabase.auth.updateUser({
				email,
				password
			});

			if (updateEmailError) throw updateEmailError;

			wasSusccessfull = true;

			userStore.user = updateEmailData.user;
		} catch (err) {
			error = err as AuthError;
		}
	}
</script>

<h1 class="text-3xl">You {user.user?.username ?? ''}</h1>
<Breadcrump />

<div class="mt-4">
	{#if !user.user}
		<div class="alert alert-warning">No user game data found or you are not logged in.</div>
	{:else}
		<Card>
			<p><strong>Username:</strong> {user.user.username}</p>
			<p><strong>Experience:</strong> {user.user.experience ?? 'Unknown'}</p>
			<p><strong>Action Points:</strong> {user.user.actionPoints}</p>
			<p><strong>Faction:</strong> {user.user.factionName ?? user.user.faction ?? 'Unknown'}</p>
			<p>
				<strong>Last Action:</strong>
				{user.user.lastAction ? user.user.lastAction.toLocaleString() : 'Never'}
			</p>
			<p><strong>Role:</strong> {user.user.role}</p>
			{#if user.user.canUseActionInSeconds !== null}
				<p>
					<strong>Action Cooldown:</strong>
					{user.user.canUseActionInSeconds}s
				</p>
			{/if}
			<p>
				<strong>Can Use Action:</strong>
				<span class={user.user.canUseAction ? 'text-success' : 'text-error'}>
					{user.user.canUseAction ? 'Yes' : 'No'}
				</span>
			</p>
		</Card>
	{/if}
</div>

{#if userStore.user?.is_anonymous && !wasSusccessfull}
	<section class="mt-4 max-w-96">
		<h2 class="text-2xl">Convert to a registered user</h2>

		<form onsubmit={submit}>
			<Fieldset>
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

				<input type="submit" class="btn btn-primary mt-4" value="Connect" />
			</Fieldset>
			{#if error}
				<div role="alert" class="alert alert-error">{error.message}</div>
			{/if}
		</form>
	</section>
{/if}

{#if wasSusccessfull}
	<div class="alert alert-info mt-4">You have converted you anonymous account into a real one.</div>
{/if}
