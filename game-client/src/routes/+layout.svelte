<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { onDestroy, onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		darkMode = event.matches;
		document.documentElement.classList.toggle('dark', darkMode);
	});

	// Optionally: initialize on load
	document.documentElement.classList.toggle('dark', darkMode);

	onMount(async () => {});

	onDestroy(() => {
		gameDestroy();
		userDestroy();
	});
</script>

<Header></Header>

<div class="container mx-auto">
	{@render children()}
</div>
