<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	import Fieldset from '$lib/components/form/fieldset.svelte';
	import { supabase, userStore } from '$lib/supabase/db.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import type { AuthError, UserAttributes } from '@supabase/supabase-js';

	let email: string = $state('');
	let password: string = $state('');
	let successFullMessage: string = $state('');
	let wasSusccessfull: boolean | null = $state(null);
	let error: AuthError | undefined = $state(undefined);

	async function changeuserData(
		data: UserAttributes,
		newSuccessFullMessage: string
	): Promise<void> {
		try {
			error = undefined;
			wasSusccessfull = null;
			successFullMessage = newSuccessFullMessage;

			const { data: updateData, error: updateError } = await supabase.auth.updateUser(data);

			if (updateError) throw updateError;

			wasSusccessfull = true;

			userStore.user = updateData.user;
		} catch (err) {
			wasSusccessfull = false;
			error = err as AuthError;
		} finally {
			setTimeout(() => {
				wasSusccessfull = null;
			}, 2000);
		}
	}

	async function submitConvertAccount(event: SubmitEvent) {
		event.preventDefault();
		await changeuserData(
			{ email, password },
			'You have converted you anonymous account into a real one.'
		);
		email = '';
		password = '';
	}

	async function submitChangePassword(event: SubmitEvent) {
		event.preventDefault();

		await changeuserData({ password }, 'You have changed your password.');
		password = '';
	}
</script>

<h1 class="text-3xl">You {user.user?.username ?? ''}</h1>
<Breadcrump />

<div class="flex flex-col items-center">
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

			<form onsubmit={submitConvertAccount}>
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

	{#if !userStore.user?.is_anonymous}
		<section class="mt-4 w-full max-w-96">
			<h2 class="text-2xl">Change password</h2>

			<form onsubmit={submitChangePassword}>
				<Fieldset>
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
		<div class="alert alert-info mt-4">{successFullMessage}</div>
	{/if}
</div>
