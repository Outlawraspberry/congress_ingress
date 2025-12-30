<script lang="ts">
	import Breadcrump from '$lib/components/breadcrump/breadcrump.svelte';
	import Fieldset from '$lib/components/form/fieldset.svelte';
	import { supabase } from '$lib/supabase/db.svelte';
	import { Info } from '@lucide/svelte';

	let enjoyed: number | null = $state(null);
	let playedAsGroup: boolean = $state(false);
	let playNextYear: boolean = $state(false);
	let moreFeedback: string = $state('');

	let error: string | null = $state(null);

	let submitted = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();

		error = null;

		const { error: supabaseError } = await supabase.from('survey').insert({
			enjoyed,
			free_text: moreFeedback,
			play_again_next_year: playNextYear,
			played_in_team: playedAsGroup
		});

		if (supabaseError) {
			error = supabaseError.message;
		} else {
			submitted = true;
		}
	}
</script>

<section>
	<h1 class="text-3xl">Survey</h1>
	<Breadcrump />

	{#if !submitted}<div class="flex flex-col items-center">
			<div class="max-w-lg">
				<div class="alert alert-success text-lg">
					<Info />
					<span>The survey will not connected to your user and is anonym</span>
				</div>
			</div>

			<form class="mt-5 w-full max-w-96" onsubmit={submit}>
				<Fieldset class="flex flex-col gap-8">
					<div>
						<label for="input-email" class="label">Did you enjoyed playing?</label>
						<div class="rating flex w-full justify-center gap-2">
							<input
								type="radio"
								name="rating-1"
								class="mask mask-star grow"
								aria-label="1 star"
								onclick={() => (enjoyed = 1)}
							/>
							<input
								type="radio"
								name="rating-1"
								class="mask mask-star grow"
								aria-label="2 star"
								onclick={() => (enjoyed = 2)}
							/>
							<input
								type="radio"
								name="rating-1"
								class="mask mask-star grow"
								aria-label="3 star"
								onclick={() => (enjoyed = 3)}
							/>
							<input
								type="radio"
								name="rating-1"
								class="mask mask-star grow"
								aria-label="4 star"
								onclick={() => (enjoyed = 4)}
							/>
							<input
								type="radio"
								name="rating-1"
								class="mask mask-star grow"
								aria-label="5 star"
								onclick={() => (enjoyed = 5)}
							/>
						</div>
					</div>

					<div>
						<label class="label">
							<input type="checkbox" bind:checked={playedAsGroup} class="checkbox" />
							Have you played as a group?
						</label>
					</div>

					<div>
						<label class="label">
							<input type="checkbox" bind:checked={playNextYear} class="checkbox" />
							Would you like to play again next year?
						</label>
					</div>

					<div>
						<label for="input-want-to-play-again" class="label"
							>Do you have any more feedback?</label
						>
						<textarea
							id="input-want-to-play-again"
							class="textarea w-full"
							bind:value={moreFeedback}
						></textarea>
					</div>

					<input type="submit" class="btn btn-primary mt-4" value="Send" />
				</Fieldset>

				{#if error != null}
					<div class="alert alert-error">
						{error}
					</div>
				{/if}
			</form>
		</div>
	{:else}
		<p class="text-center text-2xl">
			Thanks for sharing your feedback and thoughts, and for playing Congress Quest!
		</p>
		<p class="text-center text-2xl">Wishing you a happy New Year!</p>
	{/if}
</section>
