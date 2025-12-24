<script>
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/supabase/db.svelte';
</script>

<section class="flex flex-col items-center gap-5">
	<div class="alert alert-warning">
		Please note, that you're an anonymous user, if you logout, you'll louse the access to the user
		and all your progress!
	</div>

	<div class="flex flex-col gap-6 md:flex-row md:gap-2">
		<a class="btn btn-primary" href="/user">Convert to a registered account</a>
		<a class="btn btn-secondary" href="/">Stay logged in</a>
		<button
			class="btn btn-ghost"
			onclick={() => {
				signOut();
				goto('/');
			}}>Logout</button
		>
	</div>
</section>
