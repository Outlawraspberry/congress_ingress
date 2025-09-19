<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PointStats from '$lib/components/point-stats.svelte';
	import QrCodeScanner from '$lib/components/qr-code-scanner.svelte';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import { getRealPoint } from '$lib/point/get-point-my-mapping-id.svelte';
	import {
		destroySelectedPoint,
		initSelectedPoint,
		selectedPoint
	} from '$lib/point/selected-point.svelte';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { Alert, Button, Heading } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import { onMount } from 'svelte';

	let scannedFromOutsideApp = page.url.searchParams.has('scannedFromOutside');

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

{#if scannedFromOutsideApp}
	<Alert dismissable color="yellow">Please scan the QR codes from inside the app.</Alert>
{/if}

{#if selectedPoint.selectedPoint}
	<Heading class="text-center" tag="h1">{selectedPoint.selectedPoint.state.point?.name}</Heading>

	<Button
		onclick={() => {
			destroySelectedPoint();
		}}>Select another point</Button
	>

	<Section>
		<PointStats point={selectedPoint.selectedPoint}></PointStats>

		<section class="container my-5 flex justify-center">
			<TaskOverview chosenPoint={selectedPoint.selectedPoint}></TaskOverview>
		</section>
	</Section>
{:else}
	<QrCodeScanner {onTextFound} />
{/if}
