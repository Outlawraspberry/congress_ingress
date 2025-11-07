<script lang="ts">
	import { user } from '$lib/supabase/user/user.svelte';
	import {
		faAddressCard,
		faGamepad,
		faHouse,
		faLockOpen,
		faUser,
		faUserTie,
		faTrophy
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import AActiveUrl from './a-active-url.svelte';
	import { page } from '$app/state';

	const { class: klass }: { class?: string } = $props();

	let activeUrl = $derived(page.url.pathname);
</script>

<div class={`dock ${klass ? klass : ''}`}>
	{#if user.user != null}
		<AActiveUrl {activeUrl} href="/">
			<Fa icon={faHouse} />
			<span class="dock-label">Home</span>
		</AActiveUrl>

		<AActiveUrl {activeUrl} href="/game/point">
			<Fa icon={faGamepad} />
			<span class="dock-label">Game</span>
		</AActiveUrl>

		<AActiveUrl {activeUrl} href="/user">
			<Fa icon={faUser} />
			<span class="dock-label">User</span>
		</AActiveUrl>

		<AActiveUrl {activeUrl} href="/scoreboard">
			<Fa icon={faTrophy} />
			<span class="dock-label">Scoreboard</span>
		</AActiveUrl>

		{#if user.user.role === 'admin'}
			<AActiveUrl {activeUrl} href="/admin" setActive={activeUrl.startsWith('/admin')}>
				<Fa icon={faUserTie} />
				<span class="dock-label">Admin Lounge</span>
			</AActiveUrl>
		{/if}

		<AActiveUrl {activeUrl} href="/logout" data-sveltekit-preload-data="off">
			<Fa icon={faUser} />
			<span class="dock-label">Logout</span>
		</AActiveUrl>
	{:else}
		<AActiveUrl {activeUrl} href="/login">
			<Fa icon={faLockOpen} />
			<span class="dock-label">Login</span>
		</AActiveUrl>
		<AActiveUrl {activeUrl} href="/register">
			<Fa icon={faAddressCard} />
			<span class="dock-label">Register</span>
		</AActiveUrl>
	{/if}
</div>
