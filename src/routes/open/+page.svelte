<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import Confetti, { type Piece } from '$lib/components/Confetti.svelte';
	import DurationBadge from '$lib/components/DurationBadge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { useHighlight } from '$lib/highlight.svelte';
	import { takenLabel } from '$lib/ui';

	let { data } = $props();

	const highlight = useHighlight('/open');

	/** Length of the done animation (check pop + burst + slide out). */
	const DONE_MS = 560;

	let finishing = $state<number | null>(null);
	let heading: HTMLHeadingElement;

	// Render with the server's clock, then switch to the viewer's local day.
	let now = $state(new Date());
	onMount(() => {
		now = new Date();
	});

	const confetti: Piece[] = [
		{ left: -26, top: 10, w: 14, h: 8, color: 'short', rotate: -24 },
		{ right: -22, top: 0, w: 12, h: 12, color: 'long' },
		{ right: -30, bottom: 30, w: 16, h: 8, color: 'mid', rotate: 30 },
		{ left: -34, bottom: 16, w: 11, h: 11, color: 'primary' }
	];
</script>

<svelte:head>
	<title>Open tasks · TaskJar</title>
</svelte:head>

<section class="screen list-screen">
	<h1 class="title heading" tabindex="-1" bind:this={heading}>Open tasks</h1>
	<p class="subline">Tap the check when it's done.</p>

	{#if data.tasks.length > 0}
		<ul class="list">
			{#each data.tasks as task (task.id)}
				{@const isFinishing = finishing === task.id}
				<li class="row" class:pop-in={task.id === highlight} class:leaving={isFinishing}>
					<DurationBadge minutes={task.minutes} />
					<div class="text">
						<p class="row-title" class:struck={isFinishing}>{task.title}</p>
						<p class="taken">{isFinishing ? 'Done!' : takenLabel(task.takenAt, now)}</p>
					</div>
					<form
						method="POST"
						action="?/done"
						use:enhance={({ cancel }) => {
							if (finishing !== null) return cancel();
							finishing = task.id;
							const started = performance.now();
							return async ({ update }) => {
								const left = DONE_MS - (performance.now() - started);
								if (left > 0) await new Promise((r) => setTimeout(r, left));
								await update();
								finishing = null;
								// The pressed button is gone; keep keyboard focus on the screen.
								heading.focus();
							};
						}}
					>
						<input type="hidden" name="id" value={task.id} />
						<button
							class="press check"
							class:checked={isFinishing}
							aria-label={isFinishing ? `${task.title} is done` : `Mark ${task.title} as done`}
						>
							<Icon
								name="check"
								size={isFinishing ? 30 : 28}
								stroke={isFinishing ? 3.4 : 3.2}
								color={isFinishing ? 'var(--on-fill)' : 'var(--check-idle)'}
								class={isFinishing ? 'checkpop' : ''}
							/>
							{#if isFinishing}<span class="burst ring" aria-hidden="true"></span>{/if}
						</button>
					</form>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="all-done">
			<div class="big-check-wrap">
				<div class="big-check checkpop">
					<Icon name="check" size={84} stroke={3} color="var(--on-fill)" />
				</div>
				<Confetti pieces={confetti} />
			</div>
			<p class="disp all-done-title">All done!</p>
			<p class="all-done-sub">Nothing open. Got a few minutes?</p>
			<a class="press btn btn-primary draw" href={resolve('/')}>Draw a task</a>
		</div>
	{/if}
</section>

<style>
	.heading {
		margin-top: 14px;
	}

	.heading:focus {
		outline: none;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin: 22px 0 0;
		padding: 0;
		overflow-x: clip;
		list-style: none;
	}

	.row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px;
		border: var(--line) solid var(--edge);
		border-radius: 22px;
		background: var(--surface);
		box-shadow: 0 5px 0 var(--edge);
	}

	.text {
		flex-grow: 1;
		min-width: 0;
	}

	.row-title {
		font-size: 18px;
		font-weight: 700;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.struck {
		text-decoration: line-through;
		text-decoration-thickness: 3px;
	}

	.taken {
		margin-top: 4px;
		color: var(--muted);
		font-size: 14px;
		font-weight: 600;
	}

	.check {
		position: relative;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		padding: 0;
		border-radius: 28px;
		background: var(--surface);
	}

	.check.checked {
		background: var(--done);
	}

	.ring {
		position: absolute;
		inset: -14px;
		border: 4px dashed var(--done);
		border-radius: 50%;
		pointer-events: none;
	}

	@media (min-width: 1024px) and (orientation: landscape) {
		.heading {
			margin-top: 0;
		}

		.list {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
			gap: 18px;
			margin-top: 32px;
		}
	}

	.all-done {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding-bottom: 20px;
		text-align: center;
	}

	.big-check-wrap {
		position: relative;
	}

	.big-check {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 150px;
		height: 150px;
		border: 4px solid var(--edge);
		border-radius: 75px;
		background: var(--done);
		box-shadow: var(--shadow-lg);
	}

	.all-done-title {
		margin-top: 18px;
		font-size: 48px;
		letter-spacing: -1.5px;
	}

	.all-done-sub {
		color: var(--muted);
		font-size: 18px;
		font-weight: 600;
	}

	.draw {
		width: auto;
		min-height: 60px;
		margin-top: 10px;
		padding: 0 28px;
		border-radius: 20px;
		font-size: 21px;
	}
</style>
