<script>
	import { A, Card, Heading, P } from 'flowbite-svelte';
</script>

<Heading class="text-center" tag="h2">Registration</Heading>

<section class="my-5 flex flex-col flex-wrap items-center justify-center gap-5 md:flex-row">
	<A href="/register/anonymous">
		<Card class="p-5">
			<Heading tag="h3">Anonymous</Heading>
			<P>
				When you register anonymously, you will be only referenced by your browser session. If it is
				gone, you have to create a new account.
			</P>
			<P>No worries, you can transform your anonymous account into a persistend one later.</P>
		</Card>
	</A>

	<P>or</P>

	<A href="/register/email">
		<Card class="p-5">
			<Heading tag="h3">With an email</Heading>
			<P>
				When you register with an email, you can login and logout every time you want. No data loss.
			</P>
		</Card>
	</A>
</section>
