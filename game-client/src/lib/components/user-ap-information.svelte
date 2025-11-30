<script lang="ts">
	import { game } from '$lib/supabase/game/game.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import type { ClassValue } from 'svelte/elements';

	const props: { class: ClassValue } = $props();
</script>

<div class={['w-full', props.class]}>
	{#if user.user && game.game}
		<progress class="progress w-full" value={user.user.actionPoints} max={game.game.max_ap}>
		</progress>
		<p class="text-center text-xs">
			Your Action Points: {user.user.actionPoints} / {game.game.max_ap}
		</p>
	{/if}
</div>
