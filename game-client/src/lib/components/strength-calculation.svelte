<script lang="ts">
	// Svelte 5: use `export let` for props
	export let user_max_damage: number = 200;
	export let user_base_damage: number = 10;
	export let group_attack_multiplier_per_user: number = 1;

	let number_of_users_at_point = 1;

	$: attack_strength = Math.min(
		user_max_damage,
		(user_base_damage + (number_of_users_at_point - 1) * group_attack_multiplier_per_user) *
			number_of_users_at_point
	);
</script>

<div class="prose max-w-none">
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

	<pre>action_strength = min(
    user_max_damage,
    user_base_damage + (number_of_users_at_point - 1) × group_attack_multiplier_per_user
) × number_of_users_at_point</pre>

	<pre><b>{attack_strength}</b> = min(
    {user_max_damage},
    {user_base_damage} + ({number_of_users_at_point} - 1) × {group_attack_multiplier_per_user}
) × {number_of_users_at_point}</pre>
</div>
