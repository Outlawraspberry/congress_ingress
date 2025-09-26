<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import type { Point, PointMapping } from '../../../../types/alias';
	import PointStats from '$lib/components/point-stats.svelte';
	import { PointState } from '$lib/supabase/game/points.svelte';

	const {
		data
	}: { data: { pointData: Point; mappingData: PointMapping[]; pointState: PointState } } = $props();

	let mappingData = $state(data.mappingData);

	async function onDeactivate(mapping: PointMapping): Promise<void> {
		const result = await supabase
			.from('point_mapping')
			.update({
				is_active: !mapping.is_active
			})
			.filter('id', 'eq', mapping.id);
		if (result.error) console.error(result.error);
		else {
			mapping.is_active = !mapping.is_active;
		}
	}

	async function onRemove(id: string): Promise<void> {
		const result = await supabase.from('point_mapping').delete().filter('id', 'eq', id);
		if (result.error) console.error(result.error);
		else {
			mappingData = mappingData.filter((mapping) => mapping.id != id);
		}
	}

	async function onNewMapping() {
		const result = await supabase
			.from('point_mapping')
			.insert({
				point_id: data.pointData.id
			})
			.select();

		if (result.data != null) {
			mappingData.push(...result.data);
		}
	}

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
	<h1 class="mt-4 mb-4 text-3xl">
		{data.pointData.name} (<span class="mt-4 mb-4 text-2xl">{data.pointData.id}</span>)
	</h1>

	<section>
		<h3 class="mt-4 mb-4 text-xl">Stats</h3>

		<PointStats point={data.pointState}></PointStats>
	</section>

	<section class="">
		<h3 class="mt-4 mb-4 text-xl">Mappings</h3>

		<button class=" btn mt-4 mb-4" onclick={onNewMapping}>Create new Mapping</button>

		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Id</th>
						<th>Is active</th>
						<th>Actions</th>
					</tr>
				</thead>

				<tbody>
					{#each mappingData as mapping, i (i)}
						<tr>
							<td>{mapping.id}</td>
							<td>{mapping.is_active}</td>

							<td class="flex gap-5">
								<a
									class={`btn btn-sm ${!mapping.is_active ? 'btn-disabled' : ''}`}
									data-sveltekit-preload-data="off"
									href={mapping.is_active ? `/game/point/${mapping.id}` : ''}
								>
									Visit
								</a>

								<button
									class="btn btn-sm"
									onclick={() => {
										onDeactivate(mapping);
									}}
								>
									{mapping.is_active ? 'Deactivate' : 'Activate'}
								</button>

								<button class="btn btn-sm" onclick={() => onGeneratePDF(mapping.id)}>
									Generate QR Code
								</button>

								<button
									class="btn btn-sm"
									onclick={() => {
										onRemove(mapping.id);
									}}
								>
									Remove
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</section>
