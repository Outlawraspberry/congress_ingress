<script lang="ts">
	import { page } from '$app/state';
	import { user } from '$lib/supabase/user/user.svelte';
	import { faHome } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

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
					<li><a href="/login">Login</a></li>
					<li><a href="/register">Register</a></li>
				{:else}
					{#if user.user.role === 'admin'}
						<li>
							<details>
								<summary>Admin Lounge</summary>
								<ul class="bg-base-100 rounded-t-none p-2">
									<li><a href="/admin/">Overview</a></li>
									<li><a href="/admin/game">Game</a></li>
									<li><a href="/admin/poing">Points</a></li>
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
