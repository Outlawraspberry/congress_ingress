<script>
	import Card from '$lib/components/card.svelte';
</script>

<section class="hero my-5">
	<div class="hero-content flex-col">
		<h1 class="text-3xl font-bold">Registration</h1>

		<div class="flex w-full flex-col items-center justify-center lg:flex-row">
			<a href="/register/anonymous">
				<Card class="p-5">
					<h2 class="text-xl font-bold">Anonymous</h2>
					<p>
						When you register anonymously, you will be only referenced by your browser session. If
						it is gone, you have to create a new account.
					</p>
				</Card>
			</a>

			<div class="divider lg:divider-horizontal font-bold">OR</div>

			<a href="/register/email">
				<Card class="p-5">
					<h2 class="text-xl font-bold">With an email</h2>
					<p>
						When you register with an email, you can login and logout every time you want. No data
						loss.
					</p>
				</Card>
			</a>
		</div>
	</div>
</section>
