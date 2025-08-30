<script>
	import { Label, Input, Checkbox, Button, Heading, A, P } from 'flowbite-svelte';
	import { Register, Section } from 'flowbite-svelte-blocks';

	let anonymus = $state(false);
</script>

<Section name="register">
	<Register href="/">
		{#snippet top()}{/snippet}
		<div class="space-y-4 p-6 sm:p-8 md:space-y-6">
			<form class="flex flex-col space-y-6" action="/">
				<Heading tag="h3">Create and account</Heading>
				<Label>
					<span>Email</span>
					<Input type="password" name="password" placeholder="your email" required />
				</Label>
				<Label>
					<span>Password</span>
					<Input type="password" name="password" placeholder="•••••" required />
				</Label>
				<Label>
					<span>Nickname</span>
					<Input type="text" name="username" placeholder="aNickname<3" required />
				</Label>
				<div class="flex items-start">
					<Checkbox>
						I accept the <A href="/">Terms and Conditions</A>
					</Checkbox>
				</div>
				<div class="flex items-start">
					<Checkbox value={anonymus}>Anonymus</Checkbox>
				</div>
				<Button type="submit" class="w-full1">Create an account</Button>
				<P>Don't want to use your email, <A href="/register/anonymous">register anonymously</A></P>
				<P>Already have an account? <A href="/">Login here</A></P>
			</form>
		</div>
	</Register>
</Section>
