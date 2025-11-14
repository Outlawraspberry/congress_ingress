<script lang="ts">
	import { game } from '$lib/supabase/game/game.svelte';
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

<div class="card bg-base-200 shadow-md">
	<div class="card-body p-4">
		<h3 class="card-title text-sm">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 10V3L4 14h7v7l9-11h-7z"
				/>
			</svg>
			Upgrade Information
		</h3>

		<div class="space-y-2 text-sm">
			<!-- Current Status -->
			<div class="flex justify-between">
				<span class="text-base-content/70">Current Level:</span>
				<span class="font-bold badge badge-primary">Level {point.level}</span>
			</div>

			{#if point.level > 0 && !isAtMaxLevel}
				<div class="flex justify-between">
					<span class="text-base-content/70">Next Level:</span>
					<span class="font-bold">Level {point.level + 1}</span>
				</div>

				<div class="flex justify-between">
					<span class="text-base-content/70">Next Max Health:</span>
					<span class="font-bold text-success">{nextLevelHealth} HP</span>
				</div>

				<div class="flex justify-between">
					<span class="text-base-content/70">Upgrade Cost:</span>
					<span class="font-bold text-warning">{upgradeCost} AP</span>
				</div>
			{/if}

			<div class="divider my-2"></div>

			<!-- Status Message -->
			<div
				class="alert {canUpgrade
					? 'alert-success'
					: isAtMaxLevel
						? 'alert-info'
						: 'alert-warning'} p-3"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					{#if canUpgrade}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					{/if}
				</svg>
				<span class="text-xs">{getUpgradeMessage()}</span>
			</div>

			{#if !isAtMaxLevel && point.level > 0}
				<!-- Requirements Checklist -->
				<div class="space-y-1 mt-2">
					<p class="text-xs font-semibold text-base-content/70">Requirements:</p>
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
						<input type="checkbox" checked={true} disabled class="checkbox checkbox-xs checkbox-success" />
						<span class="text-xs">Point Owned by Your Faction</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
