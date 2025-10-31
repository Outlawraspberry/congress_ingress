<script lang="ts">
	import { calculateStrength } from './calculations';
	import StrengthChart from './strength-chart.svelte';

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

	let attack_strength = $derived(
		calculateStrength({
			groupModifier: group_attack_multiplier_per_user,
			numberOfUsersAtPoint: number_of_users_at_point,
			userBaseDamage: user_base_damage,
			userMaxDamage: user_max_damage
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

	<StrengthChart {group_attack_multiplier_per_user} {user_base_damage} {user_max_damage} />
</section>
