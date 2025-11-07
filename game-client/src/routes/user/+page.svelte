<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	// Props from SvelteKit load function
	let {
		data
	}: {
		data: {
			user: { id: string; name: string };
			userGameData: {
				experience: number;
				faction_id: string;
				last_action: string;
				user_id: string;
			} | null;
			factionName: string | null;
			error: string;
		};
	} = $props();
</script>

<h1 class="text-3xl">You {data.user.name}</h1>
<Breadcrump />

<div class="mt-4">
	{#if data.error}
		<div class="alert alert-error">{data.error}</div>
	{:else if data.user && data.userGameData}
		<Card>
			<p><strong>User ID:</strong> {data.user.id}</p>
			<p><strong>Experience:</strong> {data.userGameData.experience}</p>
			<p><strong>Faction:</strong> {data.factionName ?? 'Unknown'}</p>
			<p><strong>Last Action:</strong> {data.userGameData.last_action}</p>
		</Card>
	{:else}
		<div class="alert alert-warning">No user game data found.</div>
	{/if}
</div>
