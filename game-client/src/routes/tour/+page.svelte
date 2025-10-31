<script lang="ts">
	import StrengthChart from '$lib/components/strength-calculation/strength-chart.svelte';
	import type { Game } from '../../types/alias';

	const { data }: { data: { gameConfig: Game } } = $props();
</script>

<h1 class="mb-4 text-2xl">Congress Quest Tour</h1>

<p class="mb-4">
	Hey, welcome to this small introduction tour. Here you'll learn the Congress Quest basics. //todo
	what's the purpose of the game?
</p>

<h2 class="text-xl">Points</h2>

What are points?

<h2 class="text-xl">Actions</h2>

How to perform actions?

<h3 class="text-lg">Claim</h3>

Claim a point

<h3 class="text-lg">Attack and Claim</h3>

Attack and claim a point

<h3 class="text-lg">Attack</h3>

Attacking a point

<h3 class="text-lg">Repair</h3>

Repair a point

<h2 class="text-xl">Working in groups</h2>

<p>
	As you can see in the chart below, if you're working in a group, your actions will be stronger.
	But this effect has a limit. A single action cannot be stronger than {data.gameConfig
		.user_max_damage}!
</p>

<StrengthChart
	class="overflow-scroll"
	user_max_damage={data.gameConfig.user_max_damage}
	user_base_damage={data.gameConfig.user_base_damage}
	group_attack_multiplier_per_user={data.gameConfig.group_attack_multiplier_per_user}
/>
