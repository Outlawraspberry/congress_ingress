<script lang="ts">
	import { supabase } from '$lib/supabase/db.svelte';
	import {
		Button,
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import type { Point, PointMapping } from '../../../../types/alias';

	const { data }: { data: { pointData: Point; mappingData: PointMapping[] } } = $props();

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

<Heading tag="h1">{data.pointData.name}</Heading>
<Heading tag="h2">{data.pointData.id}</Heading>

<Button onclick={onNewMapping}>Create new</Button>

<Section>
	<Heading tag="h3">Mappings</Heading>

	<Table>
		<TableHead>
			<TableHeadCell>Id</TableHeadCell>
			<TableHeadCell>Is active</TableHeadCell>
			<TableHeadCell>Deactivate</TableHeadCell>
			<TableHeadCell>Remove</TableHeadCell>
			<TableHeadCell>QR Code</TableHeadCell>
		</TableHead>
		<TableBody>
			{#if mappingData.length == 0}
				No mappings
			{/if}
			{#each mappingData as mapping, i (i)}
				<TableBodyRow>
					<TableBodyCell>{mapping.id}</TableBodyCell>
					<TableBodyCell>{mapping.is_active}</TableBodyCell>
					<TableBodyCell>
						<Button
							size="xs"
							onclick={() => {
								onDeactivate(mapping);
							}}
						>
							Deactivate
						</Button>
					</TableBodyCell>
					<TableBodyCell>
						<Button
							size="xs"
							onclick={() => {
								onRemove(mapping.id);
							}}
						>
							Remove
						</Button>
					</TableBodyCell>
					<TableBodyCell>
						<Button size="xs" onclick={() => onGeneratePDF(mapping.id)}>Generate QR Code</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</Section>
