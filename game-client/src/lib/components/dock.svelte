<script>
	import { user } from '$lib/supabase/user/user.svelte';
	import {
		faAddressCard,
		faGamepad,
		faHouse,
		faLockOpen,
		faUser,
		faUserTie
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
</script>

<div class="dock">
	{#if user.user != null}
		<a href="/">
			<Fa icon={faHouse} />
			<span class="dock-label">Home</span>
		</a>

		<a href="/game/point">
			<Fa icon={faGamepad} />
			<span class="dock-label">Game</span>
		</a>

		{#if user.user.role === 'admin'}
			<a href="/admin">
				<Fa icon={faUserTie} />
				<span class="dock-label">Admin Lounge</span>
			</a>
		{/if}

		<a href="/logout" data-sveltekit-preload-data="off">
			<Fa icon={faUser} />
			<span class="dock-label">Logout</span>
		</a>
	{:else}
		<a href="/login">
			<Fa icon={faLockOpen} />
			<span class="dock-label">Login</span>
		</a>
		<a href="/register">
			<Fa icon={faAddressCard} />
			<span class="dock-label">Register</span>
		</a>
	{/if}
</div>
