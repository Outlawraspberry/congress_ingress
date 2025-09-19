<script lang="ts">
	import { Alert, Button, P } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
	import { onMount } from 'svelte';

	let { onTextFound: onFoundCode }: { onTextFound: (codeText: string) => void } = $props();

	let isLoadingDevices = $state(true);
	let isScanning = $state(false);

	let html5QrCode: Html5Qrcode | null = $state(null);
	let readerDiv: HTMLDivElement | null = $state(null);

	let devices: CameraDevice[] = $state([]);
	let currentDeviceIndex: number | null = null;

	let currentDevice: CameraDevice | null = $derived(
		devices.length > 0 && currentDeviceIndex !== null ? devices[currentDeviceIndex] : null
	);

	$effect(() => {
		if (readerDiv != null) html5QrCode = new Html5Qrcode(/* element id */ 'reader');
	});

	onMount(async () => {
		devices = await Html5Qrcode.getCameras();

		if (devices.length > 0) {
			currentDeviceIndex = 0;
			startScanning();
		}

		isLoadingDevices = false;
	});

	async function scanQr() {
		if (html5QrCode == null || currentDeviceIndex === null) return;

		html5QrCode.start(
			devices[currentDeviceIndex].id,
			{
				fps: 10 // Optional, frame per seconds for qr code scanning
			},
			(text) => {
				onFoundCode(text);
				stopScanning();
			},
			() => {}
		);
	}

	async function startScanning() {
		if (currentDeviceIndex !== null) {
			await scanQr();
			isScanning = true;
		}
	}

	async function stopScanning() {
		if (html5QrCode?.isScanning) {
			await html5QrCode?.stop();
			isScanning = false;
		}
	}

	async function switchCamera(): Promise<void> {
		if (currentDeviceIndex !== null) {
			await stopScanning();
			currentDeviceIndex = (currentDeviceIndex + 1) % devices.length;
			startScanning();
		}
	}
</script>

<Section divClass="flex justify-center items-center">
	{#if isScanning}
		<Button onclick={stopScanning}>Stop scanning</Button>
	{:else}
		<Button onclick={startScanning}>Start Scanning</Button>
	{/if}

	{#if currentDevice == null && isLoadingDevices === false}
		<Alert color="red">
			It seems, that you don't have a camera in your devices, or didn't allowed us to use your
			camera..</Alert
		>
	{/if}
</Section>

<div bind:this={readerDiv} id="reader"></div>

<Section divClass="flex justify-center items-center flex-wrap flex-col">
	{#if isScanning && currentDevice}
		<P>{currentDevice.label}</P>
		<Button onclick={switchCamera}>Switch device</Button>
	{/if}
</Section>
