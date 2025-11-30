<script lang="ts">
	import { game } from '$lib/supabase/game/game.svelte';
	import { faBolt } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import type { Point } from '../../types/alias';

	const { point }: { point: Point } = $props();

	const maxLevel = $derived(game.game?.max_point_level ?? 3);
	const healthPerLevel = $derived(game.game?.health_per_point_level ?? 255);
	const upgradeCost = $derived(game.game?.upgrade_point_ap_cost ?? 50);

	const canUpgrade = $derived(
		point.health === point.max_health && point.level < maxLevel && point.level > 0
	);

	const isAtMaxLevel = $derived(point.level >= maxLevel);
	const needsHealing = $derived(point.health < point.max_health);
	const nextLevelHealth = $derived((point.level + 1) * healthPerLevel);

	const getUpgradeMessage = () => {
		if (point.level === 0) {
			return 'Claim this point first to enable upgrades';
		}
		if (isAtMaxLevel) {
			return `This point is at maximum level (${maxLevel})`;
		}
		if (needsHealing) {
			return `Point must be at full health to upgrade (${point.health}/${point.max_health})`;
		}
		if (canUpgrade) {
			return `Ready to upgrade! Next level: ${point.level + 1}`;
		}
		return 'Upgrade not available';
	};
</script>

<div class="collapse-arrow bg-base-200 collapse w-full shadow-md">
	<input type="checkbox" />
	<div class="collapse-title font-semibold">
		<Fa icon={faBolt} class="mr-2 inline"></Fa>
		Upgrade Information
	</div>

	<div class="collapse-content">
		<div class="space-y-2 text-sm">
			<!-- Current Status -->
			<div class="flex justify-between">
				<span class="text-base-content/70">Current Level:</span>
				<span class="badge badge-primary font-bold">Level {point.level}</span>
			</div>

			{#if point.level > 0 && !isAtMaxLevel}
				<div class="flex justify-between">
					<span class="text-base-content/70">Next Level:</span>
					<span class="font-bold">Level {point.level + 1}</span>
				</div>

				<div class="flex justify-between">
					<span class="text-base-content/70">Next Max Health:</span>
					<span class="text-success font-bold">{nextLevelHealth} HP</span>
				</div>

				<div class="flex justify-between">
					<span class="text-base-content/70">Upgrade Cost:</span>
					<span class="text-warning font-bold">{upgradeCost} AP</span>
				</div>
			{/if}

			<div class="divider my-2"></div>

			{#if !isAtMaxLevel && point.level > 0}
				<!-- Requirements Checklist -->
				<div class="mt-2 space-y-1">
					<p class="text-base-content/70 text-xs font-semibold">Requirements:</p>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={!needsHealing}
							disabled
							class="checkbox checkbox-xs checkbox-success"
						/>
						<span class="text-xs">Full Health ({point.health}/{point.max_health})</span>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={point.level < maxLevel}
							disabled
							class="checkbox checkbox-xs checkbox-success"
						/>
						<span class="text-xs">Below Max Level ({point.level}/{maxLevel})</span>
					</div>
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={true}
							disabled
							class="checkbox checkbox-xs checkbox-success"
						/>
						<span class="text-xs">Point Owned by Your Faction</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
