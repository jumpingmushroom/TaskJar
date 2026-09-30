<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';

	let { data, form } = $props();

	let confirming = $state(false);
	let dismissed = $state(false);
	// Without JavaScript the server asks for confirmation (409 + confirmDelete).
	const askToConfirm = $derived(confirming || (!dismissed && !!form && 'confirmDelete' in form));
	const failed = $derived(form && 'errors' in form ? form : undefined);
</script>

<svelte:head>
	<title>Edit task · TaskJar</title>
</svelte:head>

<section class="screen">
	<div class="screen-header start">
		<a class="press icon-btn" href={resolve('/jar')} aria-label="Back">
			<Icon name="back" />
		</a>
		<h1 class="disp form-title">Edit task</h1>
	</div>
	<TaskForm
		action="?/save"
		title={failed?.title ?? data.task.title}
		minutes={failed?.minutes || data.task.minutes}
		serverErrors={failed?.errors}
		submitLabel="Save changes"
	>
		{#snippet extra()}
			{#if askToConfirm}
				<div class="confirm pop-in" role="alertdialog" aria-labelledby="confirm-title">
					<p id="confirm-title" class="disp confirm-title">Delete this task?</p>
					<div class="confirm-actions">
						<a
							class="press btn"
							href={resolve('/jar/[id=integer]', { id: String(data.task.id) })}
							onclick={(e) => {
								e.preventDefault();
								confirming = false;
								dismissed = true;
							}}
						>
							Keep it
						</a>
						<button
							type="submit"
							class="press btn delete"
							formaction="?/delete"
							formnovalidate
							name="confirm"
							value="yes"
						>
							Yes, delete
						</button>
					</div>
				</div>
			{:else}
				<button
					type="submit"
					class="press btn delete spaced"
					formaction="?/delete"
					formnovalidate
					onclick={(e) => {
						e.preventDefault();
						confirming = true;
					}}
				>
					Delete task
				</button>
			{/if}
		{/snippet}
	</TaskForm>
</section>

<style>
	.confirm {
		margin-top: 14px;
		padding: 16px;
		border: var(--line) solid var(--edge);
		border-radius: 20px;
		background: var(--surface);
	}

	.confirm-title {
		font-size: 20px;
	}

	.confirm-actions {
		display: flex;
		gap: 10px;
		margin-top: 12px;
	}

	.delete {
		color: var(--error);
	}

	.spaced {
		margin-top: 14px;
	}
</style>
