<script>
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/supabase/db.svelte';
</script>

<section class="flex flex-col items-center gap-5">
	<div class="alert alert-warning">
		Please note, that you're an anonymous user, if you logout, you'll louse the access to the user
		and all your progress!
	</div>

	<div>
		<a class="btn btn-primary" href="/">Stay logged in</a>
		<button
			class="btn btn-secondary"
			onclick={() => {
				signOut();
				goto('/');
			}}>Logout</button
		>
	</div>
</section>
