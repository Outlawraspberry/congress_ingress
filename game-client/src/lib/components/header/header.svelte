<script lang="ts">
	import { page } from '$app/state';
	import { user } from '$lib/supabase/user/user.svelte';
	import { faHome } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import LiActiveUrl from './li-active-url.svelte';

	let { class: klass }: { class?: string } = $props();

	let activeUrl = $derived(page.url.pathname);
</script>

<header class={klass ?? ''}>
	<div class="navbar bg-base-100 shadow-sm">
		<div class="flex-1">
			<a class="btn btn-ghost text-xl" href="/"><Fa icon={faHome} />Home</a>
		</div>

		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				{#if user.user == null}
					<LiActiveUrl href="/login" {activeUrl}>Login</LiActiveUrl>
					<LiActiveUrl href="/register" {activeUrl}>Register</LiActiveUrl>
				{:else}
					{#if user.user.role === 'admin'}
						<li class={activeUrl.includes('/admin') ? 'font-bold' : ''}>
							<details>
								<summary>Admin Lounge</summary>
								<ul class="bg-base-100 z-10 rounded-t-none p-2">
									<LiActiveUrl href="/admin" {activeUrl}>Overview</LiActiveUrl>
									<LiActiveUrl href="/admin/game" {activeUrl}>Game</LiActiveUrl>
									<LiActiveUrl href="/admin/point" {activeUrl}>Points</LiActiveUrl>
								</ul>
							</details>
						</li>
					{/if}

					<li><a href="/logout" data-sveltekit-preload-data="off">Logout</a></li>
				{/if}
			</ul>
		</div>
	</div>
</header>
