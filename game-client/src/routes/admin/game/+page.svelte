<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Card from '$lib/components/card.svelte';
	import RunTick from '$lib/components/run-tick.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import { onMount } from 'svelte';
	import { type Game } from '../../../types/alias';
	import Fieldset from '$lib/components/form/fieldset.svelte';

	let gameConfig: Game | null = null;
	let loading = true;
	let error = '';
	let success = '';

	async function fetchGameConfig() {
		loading = true;
		const { data, error: fetchError } = await supabase
			.from('game')
			.select('*')
			.eq('id', 1)
			.single();
		if (fetchError) {
			error = fetchError.message;
		} else {
			gameConfig = data;
		}
		loading = false;
	}

	async function saveConfig(): Promise<void> {
		if (gameConfig == null) return;
		error = '';
		success = '';
		const { error: updateError } = await supabase
			.from('game')
			.update({
				state: gameConfig.state,
				group_attack_multiplier_per_user: gameConfig.group_attack_multiplier_per_user,
				group_repair_multiplier_per_user: gameConfig.group_repair_multiplier_per_user,
				user_base_damage: gameConfig.user_base_damage,
				user_base_repair: gameConfig.user_base_repair,
				user_max_damage: gameConfig.user_max_damage,
				user_last_action_timeout_in_seconds: gameConfig.user_last_action_timeout_in_seconds,
				point_user_kick_timeout_seconds: gameConfig.point_user_kick_timeout_seconds
			})
			.eq('id', 1);
		if (updateError) {
			error = updateError.message;
		} else {
			success = 'Configuration updated!';
		}
	}

	onMount(fetchGameConfig);
</script>

<h1 class="text-3xl">Game Configuration</h1>
<Breadcrump />

<section class="my-5 flex flex-wrap justify-center gap-5">
	<div class="">
		{#if loading}
			<div class="text-center">Loading...</div>
		{:else if error}
			<div class="alert alert-error">{error}</div>
		{:else if gameConfig}
			<form on:submit|preventDefault={saveConfig} class="flex w-xs flex-col">
				<Fieldset>
					<label for="form-config-state" class="label">State</label>
					<select
						class="select select-bordered"
						id="form-config-state"
						bind:value={gameConfig.state}
					>
						<option value="playing">Playing</option>
						<option value="paused">Paused</option>
					</select>

					<RunTick></RunTick>
				</Fieldset>

				<Fieldset>
					<legend class="fieldset-legend">Action Strength</legend>

					<label for="form_config-group-attack-multiplier" class="label">
						Group Attack Multiplier Per User
					</label>
					<input
						id="form-config-group-attack-multiplier"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.group_attack_multiplier_per_user}
						min="1"
					/>

					<label class="label" for="form-config-group-repair-multiplier">
						Group Repair Multiplier Per User
					</label>
					<input
						id="form-config-group-repair-multiplier"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.group_repair_multiplier_per_user}
						min="1"
					/>

					<label class="label" for="form-config-user-base-damage"> User Base Damage </label>
					<input
						id="form-config-user-base-damage"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.user_base_damage}
						min="1"
					/>

					<label class="label" for="form-config--user-base-repair"> User Base Repair </label>
					<input
						id="form-config--user-base-repair"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.user_base_repair}
						min="1"
					/>

					<label class="label" for="form-config-user-max-damage"> User Max Damage </label>
					<input
						id="form-config-user-max-damage"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.user_max_damage}
						min="1"
					/>
				</Fieldset>

				<Fieldset>
					<legend class="fieldset-legend">Timeouts</legend>

					<label class="label" for="form-config-last-action-timeout">
						User Last Action Timeout (seconds)
					</label>
					<input
						id="form-config-last-action-timeout"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.user_last_action_timeout_in_seconds}
						min="1"
					/>

					<label class="label" for="form-config-user-point-kick-timeout">
						Point User Kick Timeout (seconds)
					</label>
					<input
						id="form-config-user-point-kick-timeout"
						class="input input-bordered"
						type="number"
						bind:value={gameConfig.point_user_kick_timeout_seconds}
						min="1"
					/>
				</Fieldset>

				<button class="btn btn-primary mt-4" type="submit">Save</button>

				{#if success}
					<div class="alert alert-success mt-2">{success}</div>
				{/if}
			</form>
		{/if}
	</div>
</section>
