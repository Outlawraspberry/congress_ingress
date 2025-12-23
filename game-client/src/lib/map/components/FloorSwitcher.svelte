<script lang="ts">
	import { currentFloorId, floors, isSwitchingFloor, switchFloor } from '../mapStore';

	async function handleFloorChange(floorId: number) {
		if ($currentFloorId === floorId) return;
		await switchFloor(floorId);
	}
</script>

<div class="flex flex-col gap-1">
	{#each $floors as floor (floor.id)}
		<button
			class={`btn h-10 w-10 text-2xl ${$currentFloorId === floor.id ? 'btn-primary' : 'btn-secondary'}`}
			on:click={() => handleFloorChange(floor.id)}
			disabled={$isSwitchingFloor}
		>
			<div class="">
				<span class="">{floor.id}</span>
			</div>
		</button>
	{/each}
</div>
