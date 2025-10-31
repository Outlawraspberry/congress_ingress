<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { calculateStrength } from './calculations';

	let {
		user_max_damage = 200,
		user_base_damage = 10,
		group_attack_multiplier_per_user = 1,
		class: clazz,
		...rest
	}: {
		user_max_damage: number;
		user_base_damage: number;
		group_attack_multiplier_per_user: number;
		class?: ClassValue;
	} = $props();

	let attackStrengths = $derived(
		Array.from({ length: 15 }, (_, i) => {
			const users = i + 1;
			return {
				users,
				strength: calculateStrength({
					groupModifier: group_attack_multiplier_per_user,
					numberOfUsersAtPoint: users,
					userBaseDamage: user_base_damage,
					userMaxDamage: user_max_damage
				})
			};
		})
	);
</script>

<div class={`my-8 ${clazz}`} {...rest}>
	<h3 class="mb-2 font-bold">Action Strength by Number of Users</h3>
	<div class="flex flex-col gap-2">
		{#each attackStrengths as { users, strength } (users)}
			<div class="flex items-center gap-2">
				<span class="w-8 text-right">{users}</span>
				<div class="bg-base-200 relative h-5 flex-1 rounded">
					<div
						class="h-5 rounded bg-blue-500"
						style="width: {Math.min(strength, user_max_damage * 1.25) /
							((user_max_damage * 1.25) / 100)}%"
						title="Attack Strength"
					></div>
					<span class="absolute top-0 left-2 text-xs text-white">{strength}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
