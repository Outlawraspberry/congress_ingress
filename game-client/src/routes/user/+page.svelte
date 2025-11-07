<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
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
