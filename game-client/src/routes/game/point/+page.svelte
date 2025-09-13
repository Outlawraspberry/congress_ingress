<script lang="ts">
	import PointStats from '$lib/components/point-stats.svelte';
	import QrCodeScanner from '$lib/components/qr-code-scanner.svelte';
	import TaskOverview from '$lib/components/task/task-overview.svelte';
	import { getRealPoint } from '$lib/point/get-point-my-mapping-id.svelte';
	import type { PointState } from '$lib/supabase/game/points.svelte';
	import { Button, Heading } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	// To use Html5Qrcode (more info below)

	let selectedPoint: PointState | null = $state(null);

	function onTextFound(decodedText: string) {
		let cleaned = decodedText.trim();
		if (decodedText.startsWith('https://congressquest.outlawraspberry.de')) {
			cleaned = decodedText.replace(
				'https://congressquest.outlawraspberry.de',
				'http://localhost:5173'
			);

			const uuid = cleaned.split('/').pop();
			if (uuid)
				getRealPoint(uuid)
					.then((pointState) => {
						selectedPoint = pointState;
					})
					.catch(console.error);
		}
	}
</script>

{#if selectedPoint}
	<Heading class="text-center" tag="h1">{selectedPoint.state.point?.name}</Heading>

	<Button
		onclick={() => {
			selectedPoint?.destroy();
			selectedPoint = null;
		}}>Select another point</Button
	>

	<Section>
		<PointStats point={selectedPoint}></PointStats>

		<section class="container my-5 flex justify-center">
			<TaskOverview chosenPoint={selectedPoint}></TaskOverview>
		</section>
	</Section>
{:else}
	<QrCodeScanner {onTextFound} />
{/if}
