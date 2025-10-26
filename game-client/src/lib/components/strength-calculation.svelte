<script lang="ts">
	let {
		user_max_damage = 200,
		user_base_damage = 10,
		group_attack_multiplier_per_user = 1,
		...rest
	}: {
		user_max_damage: number;
		user_base_damage: number;
		group_attack_multiplier_per_user: number;
	} = $props();

	let number_of_users_at_point = $state(1);

	function calculateStrength({
		groupModifier,
		numberOfUsersAtPoint,
		userBaseDamage,
		userMaxDamage
	}: {
		userMaxDamage: number;
		userBaseDamage: number;
		numberOfUsersAtPoint: number;
		groupModifier: number;
	}): number {
		return Math.min(
			userMaxDamage,
			(userBaseDamage + (numberOfUsersAtPoint - 1) * groupModifier) * numberOfUsersAtPoint
		);
	}

	let attack_strength = $derived(
		calculateStrength({
			groupModifier: group_attack_multiplier_per_user,
			numberOfUsersAtPoint: number_of_users_at_point,
			userBaseDamage: user_base_damage,
			userMaxDamage: user_max_damage
		})
	);

	// Calculate attack strength for user counts 1-10
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

<section {...rest}>
	<h2>Strength Calculation Simulator</h2>
	<form class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="">
			<label for="input-number-of-users" class="label">number_of_users_at_point</label>
			<input
				class="input input-bordered"
				id="input-number-of-users"
				type="number"
				bind:value={number_of_users_at_point}
				min="1"
			/>
		</div>
	</form>

	<h3>Action Strength</h3>

	<div class="mockup-code mb-4 w-full">
		<pre>action_strength = min(
    user_max_damage,
    user_base_damage + (number_of_users_at_point - 1) × group_attack_multiplier_per_user
  ) × number_of_users_at_point</pre>
	</div>

	<div class="mockup-code w-full">
		<pre><b>{attack_strength}</b> = min(
    {user_max_damage},
    {user_base_damage} + ({number_of_users_at_point} - 1) × {group_attack_multiplier_per_user}
  ) × {number_of_users_at_point}</pre>
	</div>

	<div class="my-8">
		<h3 class="mb-2 font-bold">Attack Strength by Number of Users</h3>
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
</section>
