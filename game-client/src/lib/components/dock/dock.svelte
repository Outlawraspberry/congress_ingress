<script lang="ts">
	import { page } from '$app/state';
	import { user } from '$lib/supabase/user/user.svelte';
	import {
		BookUser,
		Building,
		Gamepad,
		LockKeyholeOpen,
		LogOut,
		Map,
		Medal,
		Section,
		User,
		UserStar
	} from '@lucide/svelte';
	import AActiveUrl from './a-active-url.svelte';

	const { class: klass }: { class?: string } = $props();

	let activeUrl = $derived(page.url.pathname);
</script>

<div class={`dock ${klass ? klass : ''}`}>
	<AActiveUrl {activeUrl} href="/">
		<Building />
		<span class="dock-label">Home</span>
	</AActiveUrl>

	{#if user.user != null}
		<AActiveUrl {activeUrl} href="/game/point">
			<Gamepad />
			<span class="dock-label">Game</span>
		</AActiveUrl>

		<AActiveUrl {activeUrl} href="/game/map">
			<Map />
			<span class="dock-label">Map</span>
		</AActiveUrl>

		<AActiveUrl {activeUrl} href="/user">
			<User />
			<span class="dock-label">User</span>
		</AActiveUrl>

		<AActiveUrl {activeUrl} href="/scoreboard">
			<Medal />
			<span class="dock-label">Scoreboard</span>
		</AActiveUrl>

		{#if user.user.role === 'admin'}
			<AActiveUrl {activeUrl} href="/admin" setActive={activeUrl.startsWith('/admin')}>
				<UserStar />
				<span class="dock-label">Admin Lounge</span>
			</AActiveUrl>
		{/if}

		<AActiveUrl {activeUrl} href="/logout" data-sveltekit-preload-data="off">
			<LogOut />
			<span class="dock-label">Logout</span>
		</AActiveUrl>
	{:else}
		<AActiveUrl {activeUrl} href="/login">
			<LockKeyholeOpen />
			<span class="dock-label">Login</span>
		</AActiveUrl>
		<AActiveUrl {activeUrl} href="/register">
			<BookUser /> <span class="dock-label">Register</span>
		</AActiveUrl>
	{/if}
	<AActiveUrl href="/legal" {activeUrl}>
		<Section />
		<span class="dock-label">Legal</span>
	</AActiveUrl>
</div>
