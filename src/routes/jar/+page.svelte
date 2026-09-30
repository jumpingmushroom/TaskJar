<script lang="ts">
	import { resolve } from '$app/paths';
	import DurationBadge from '$lib/components/DurationBadge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { useHighlight } from '$lib/highlight.svelte';

	let { data } = $props();

	const highlight = useHighlight('/jar');
	const count = $derived(data.tasks.length);
</script>

<svelte:head>
	<title>The jar · TaskJar</title>
</svelte:head>

<section class="screen list-screen">
	<div class="screen-header heading">
		<h1 class="title">The jar</h1>
		<a class="press add" href={resolve('/jar/new')}>
			<Icon name="plus" size={18} stroke={3.2} />Add task
		</a>
	</div>
	<p class="subline">
		{count === 1 ? '1 task waiting to be drawn.' : `${count} tasks waiting to be drawn.`}
	</p>

	{#if count > 0}
		<ul class="list">
			{#each data.tasks as task (task.id)}
				<li class="row" class:pop-in={task.id === highlight}>
					<DurationBadge minutes={task.minutes} size="md" />
					<span class="row-title">{task.title}</span>
					<a
						class="edit"
						href={resolve('/jar/[id=integer]', { id: String(task.id) })}
						aria-label="Edit {task.title}"
					>
						<Icon name="chevron" size={20} />
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">The jar is empty. Add a few small tasks to get started.</p>
	{/if}
</section>

<style>
	.heading {
		margin-top: 14px;
	}

	.add {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 48px;
		padding: 0 16px;
		border-radius: 16px;
		background: var(--primary);
		color: var(--on-fill);
		font-size: 16px;
		font-weight: 800;
		white-space: nowrap;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 10px 10px 12px;
		border: var(--line) solid var(--edge);
		border-radius: 20px;
		background: var(--surface);
	}

	.row-title {
		flex-grow: 1;
		min-width: 0;
		font-size: 17px;
		font-weight: 700;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.edit {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: var(--soft);
		color: var(--text);
	}

	.edit:hover {
		filter: brightness(0.97);
	}

	@media (min-width: 1024px) and (orientation: landscape) {
		.heading {
			margin-top: 0;
		}

		.add {
			height: 56px;
			padding: 0 22px;
			border-radius: 18px;
			box-shadow: var(--shadow);
			font-size: 18px;
		}

		.list {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
			gap: 14px;
			margin-top: 32px;
		}

		.empty {
			max-width: 560px;
			margin: 64px auto 0;
		}
	}

	.empty {
		margin-top: 40px;
		padding: 24px;
		border: var(--line) dashed var(--edge);
		border-radius: 24px;
		text-align: center;
		font-size: 18px;
		font-weight: 700;
	}
</style>
