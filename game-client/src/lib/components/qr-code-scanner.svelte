<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { Section } from 'flowbite-svelte-blocks';
	import { Html5Qrcode } from 'html5-qrcode';

	let { onTextFound: onFoundCode }: { onTextFound: (codeText: string) => void } = $props();

	let isScanning = $state(false);

	let html5QrCode: Html5Qrcode | null = $state(null);

	let readerDiv: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (readerDiv != null) html5QrCode = new Html5Qrcode(/* element id */ 'reader');
	});

	// This method will trigger user permissions
	function getCamera() {
		return Html5Qrcode.getCameras().then((devices) => {
			/**
			 * devices would be an array of objects of type:
			 * { id: "id", label: "label" }
			 */
			if (devices && devices.length) {
				return devices[0].id;
				// .. use this to start scanning.
			}
			throw new Error('no device found');
		});
	}

	async function scanQr(cameraId: string) {
		if (html5QrCode == null) return;

		html5QrCode.start(
			cameraId,
			{
				fps: 10, // Optional, frame per seconds for qr code scanning
				qrbox: { width: 400, height: 400 } // Optional, if you want bounded box UI
			},
			(text) => {
				onFoundCode(text);
				stopScanning();
			},
			() => {}
		);
	}

	async function startScanning() {
		const cameraId = await getCamera();
		await scanQr(cameraId);
		isScanning = true;
	}

	async function stopScanning() {
		await html5QrCode?.stop();
		isScanning = false;
	}
</script>

<Section divClass="flex justify-center items-center"
	>{#if isScanning}
		<Button onclick={stopScanning}>Stop scanning</Button>
	{:else}
		<Button onclick={startScanning}>Start Scanning</Button>
	{/if}
</Section>

<div bind:this={readerDiv} id="reader"></div>
