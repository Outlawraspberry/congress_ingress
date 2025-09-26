<script>
	import { Card, Heading, P } from 'flowbite-svelte';
</script>

<section class="hero my-5">
	<div class="hero-content flex-col">
		<h1 class="text-3xl font-bold">Registration</h1>

		<div class="flex flex-col lg:flex-row">
			<a href="/register/anonymous">
				<Card class="p-5">
					<Heading tag="h3">Anonymous</Heading>
					<P>
						When you register anonymously, you will be only referenced by your browser session. If
						it is gone, you have to create a new account.
					</P>
					<P>No worries, you can transform your anonymous account into a persistend one later.</P>
				</Card>
			</a>

			<div class="divider font-bold">OR</div>

			<a href="/register/email">
				<Card class="p-5">
					<Heading tag="h3">With an email</Heading>
					<P>
						When you register with an email, you can login and logout every time you want. No data
						loss.
					</P>
				</Card>
			</a>
		</div>
	</div>
</section>
