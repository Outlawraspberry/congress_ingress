<script lang="ts">
	import { goto } from '$app/navigation';
	import PointStats from '$lib/components/point-stats.svelte';
	import QrCodeScanner from '$lib/components/qr-code-scanner.svelte';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import {
		destroySelectedPoint,
		initSelectedPoint,
		selectedPoint
	} from '$lib/point/selected-point.svelte';
	import { user } from '$lib/supabase/user/user.svelte';
	import { onMount } from 'svelte';

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

<div class="breadcrumbs text-sm">
	<ul>
		<li><a href="/">/</a></li>
		<li>
			<button
				onclick={() => {
					destroySelectedPoint();
				}}
			>
				game
			</button>
		</li>
		{#if selectedPoint.selectedPoint != null}
			<li>{selectedPoint.selectedPoint.state.point?.name}</li>
		{/if}
	</ul>
</div>

<section class="hero">
	<div class="hero-content w-full flex-col">
		{#if selectedPoint.selectedPoint}
			<section class="w-full">
				<PointStats class="w-full" point={selectedPoint.selectedPoint}></PointStats>

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
			</section>

			<button
				class="btn btn-secondary btn-xl"
				onclick={() => {
					destroySelectedPoint();
				}}
				>Select another point
			</button>
		{:else}
			<p class="mb-6 text-3xl font-bold">Okay, how do I play now?</p>

			<p class="mb-6 w-sm">
				It's very easy. All over the place, you'll find QRCodes on the wall. Scan them, and you can
				play!
			</p>

			<QrCodeScanner {onTextFound} />
		{/if}
	</div>
</section>
