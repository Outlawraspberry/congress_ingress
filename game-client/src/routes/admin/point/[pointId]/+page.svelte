<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import PointStats from '$lib/components/point-stats.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import { PointState } from '$lib/supabase/game/points.svelte';
	import type { Point } from '../../../../types/alias';

	const { data }: { data: { pointData: Point; pointState: PointState } } = $props();

	async function onGeneratePDF(mappingId: string): Promise<void> {
		const result = await supabase.functions.invoke('generate-mapping-pdf', {
			body: {
				pointId: data.pointData.id,
				mappingId
			}
		});

		const binaryString = atob(result.data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		const blob = new Blob([bytes], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `mapping_${mappingId}_to_point_${data.pointData.id}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
</script>

<section>
	<h1 class="mb-3 text-3xl font-bold">
		{data.pointData.name} (<span class="mt-4 mb-4 text-2xl">{data.pointData.id}</span>)
	</h1>

	<Breadcrump />

	<section>
		<h3 class="mt-4 mb-4 text-xl">Stats</h3>

		<PointStats point={data.pointState}></PointStats>

		<p class="mb-2 text-lg">
			<strong>Type:</strong> <span class="badge badge-info">{data.pointData.type}</span>
		</p>
	</section>

	<button class="btn btn-sm" onclick={() => onGeneratePDF(data.pointData.id)}>
		Generate QR Code
	</button>

	<a class="btn btn-sm" data-sveltekit-preload-data="off" href={`/game/point/${data.pointData.id}`}>
		Visit
	</a>
</section>
