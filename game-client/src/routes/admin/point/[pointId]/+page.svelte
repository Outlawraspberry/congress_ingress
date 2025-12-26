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
		a.download = `${data.pointData.name}.pdf`;
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

	<div class="mt-4 flex gap-2">
		<a class="btn btn-primary btn-sm" href={`/admin/point/${data.pointData.id}/edit`}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
			Edit
		</a>

		<button class="btn btn-sm" onclick={() => onGeneratePDF(data.pointData.id)}>
			Generate QR Code
		</button>

		<a
			class="btn btn-sm"
			data-sveltekit-preload-data="off"
			href={`/game/point/${data.pointData.id}`}
		>
			Visit
		</a>
	</div>
</section>
