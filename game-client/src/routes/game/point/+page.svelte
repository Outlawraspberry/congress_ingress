<script lang="ts">
	import { goto } from '$app/navigation';
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import PointStats from '$lib/components/point-stats.svelte';
	import QrCodeScanner from '$lib/components/qr-code-scanner.svelte';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import UpgradeInfo from '$lib/components/upgrade-info.svelte';
	import UserApInformation from '$lib/components/user-ap-information.svelte';
	import {
		destroySelectedPoint,
		initSelectedPoint,
		selectedPoint
	} from '$lib/point/selected-point.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import { onMount } from 'svelte';
	import PointDescription from './components/point-description.svelte';

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete('scannedFromOutside');
		goto(`?${searchParams.toString()}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	});

	function onTextFound(decodedText: string) {
		let cleaned = decodedText.trim();
		if (decodedText.startsWith('https://congressquest.outlawraspberry.de')) {
			cleaned = decodedText.replace(
				'https://congressquest.outlawraspberry.de',
				'http://localhost:5173'
			);

			const uuid = cleaned.split('/').pop();
			if (uuid) initSelectedPoint(uuid);
		}
	}
</script>

{#if selectedPoint.selectedPoint}
	<h1 class="mb-3 text-3xl font-bold">{selectedPoint.selectedPoint.state.point?.name}</h1>
{:else}
	<h1 class="mb-3 text-3xl font-bold">Play the game</h1>{/if}

<Breadcrump />

<section class="flex flex-col items-center">
	<section class="w-full max-w-md flex-col items-center justify-center gap-0 md:flex-row md:gap-10">
		{#if selectedPoint.selectedPoint}
			<div class="max-w-80">
				<a href="/user"><UserApInformation class="mb-5 hidden md:block" /></a>

				<PointDescription />
			</div>

			<div>
				<section class="flex w-full flex-col items-center">
					{#if selectedPoint?.selectedPoint.state.point?.type === 'claimable'}
						<PointStats class="w-full" point={selectedPoint.selectedPoint}></PointStats>

						{#if selectedPoint.selectedPoint.state.point?.acquired_by === user.user?.faction && selectedPoint.selectedPoint.state.point}
							<div class="my-4">
								<UpgradeInfo point={selectedPoint.selectedPoint.state.point}></UpgradeInfo>
							</div>
						{/if}
					{/if}

					{#if user.user?.canUseActionInSeconds}
						<p class="text-center">
							In
							<span class="countdown font-mono text-2xl">
								<span
									style={`--value:${user.user.canUseActionInSeconds};`}
									aria-live="polite"
									aria-label={user.user.canUseActionInSeconds.toString()}
									>{user.user.canUseActionInSeconds}</span
								>
							</span>
							seconds, you can do your next action
						</p>
					{:else if !selectedPoint.selectedPoint.state.kicked}
						<section class="container flex justify-center">
							<TaskOverview chosenPoint={selectedPoint.selectedPoint}></TaskOverview>
						</section>
					{:else}
						<div role="alert" class="alert alert-info">
							You were kicked because you were at this point for too long without doing nothing!
						</div>
					{/if}

					<button
						class="btn btn-secondary btn-xl mt-5"
						onclick={() => {
							destroySelectedPoint();
						}}
						>Select another point
					</button>
				</section>
			</div>
		{:else}
			<div>
				<p class=" text-3xl font-bold">Okay, how do I play now?</p>

				<p class="mt-6 w-sm">
					It's very easy. All over the congress, you'll find QR-Codes on the wall, tables or
					similar. Scan them, and you can play!
				</p>

				<p class="mt-6">
					To perform actions, you need action points (AP). To get AP, you have to play minigames at
					special points on the C3. You can spot these mini game points on the
					<a href="/game/map" class="link"> map</a> easially.
				</p>

				<p class="mt-6">
					A small hint, when you play as a group, your actions will get stronger. 😉
				</p>

				<QrCodeScanner {onTextFound} />
			</div>
		{/if}
	</section>
</section>
