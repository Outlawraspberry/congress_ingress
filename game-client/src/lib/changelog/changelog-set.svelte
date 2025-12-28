<script lang="ts">
	import type { ChangeSet } from './changelog';

	let { changes }: { changes: ChangeSet[] } = $props();
</script>

<div class="flex flex-col items-center">
	{#each changes as change (change.timestamp)}
		<section class="card bg-base-200 w-full max-w-96">
			<div class="card-body">
				<h2 class="card-title">
					{new Date(change.timestamp).toLocaleString()}
				</h2>

				<div class="prose text-md text-left">
					<ul>
						{#each change.lineContent as content, index (index)}
							<li class="">
								{content}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>
	{/each}
</div>
