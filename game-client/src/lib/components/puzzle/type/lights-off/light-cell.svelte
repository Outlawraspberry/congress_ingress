<script lang="ts">
	const {
		isOn,
		row,
		col,
		onToggle
	}: {
		isOn: boolean;
		row: number;
		col: number;
		onToggle: (row: number, col: number) => void;
	} = $props();

	function handleClick() {
		onToggle(row, col);
	}
</script>

<button
	type="button"
	class="aspect-square w-full rounded-lg border-2 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
	class:bg-warning={isOn}
	class:border-warning={isOn}
	class:shadow-lg={isOn}
	class:shadow-warning:50={isOn}
	class:bg-base-300={!isOn}
	class:border-base-content:20={!isOn}
	onclick={handleClick}
	aria-label={`Light at row ${row + 1}, column ${col + 1}, currently ${isOn ? 'on' : 'off'}`}
>
	<div class="flex h-full w-full items-center justify-center">
		{#if isOn}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-8 w-8"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
				/>
			</svg>
		{:else}
			<div class="text-base-content/30 text-2xl">○</div>
		{/if}
	</div>
</button>
