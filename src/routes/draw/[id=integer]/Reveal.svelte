<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import Confetti, { type Piece } from '$lib/components/Confetti.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import JarArt from '$lib/components/JarArt.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import { isHydrated } from '$lib/client';
	import { durationColor } from '$lib/ui';

	interface Shown {
		title: string;
		minutes: number;
	}

	let {
		minutes,
		task,
		afterSkip,
		sample,
		gone
	}: {
		minutes: number;
		task: (Shown & { id: number }) | null;
		afterSkip: boolean;
		sample: Shown[];
		gone: boolean;
	} = $props();

	const SHUFFLE_TICKS = 8;
	const SHUFFLE_TICK_MS = 80;

	// Shuffle only after an in-app navigation (never on a hard load, where the
	// server already rendered the pick) and never with reduced motion.
	let phase = $state<'shuffle' | 'landed'>(
		(() => task && isHydrated() && !prefersReducedMotion.current)() ? 'shuffle' : 'landed'
	);
	let flick = $state<Shown>((() => sample[0] ?? task ?? { title: '', minutes })());
	let busy = $state(false);

	// Leaving a pending reveal through in-app navigation other than its own
	// buttons (a link, the browser back button) marks the draw abandoned, best
	// effort. Reloads keep the draw; closed tabs expire server-side.
	// Captured now: on a browser back, the address bar has already changed.
	const backAction = `${page.url.pathname}?/back`;
	beforeNavigate(({ type }) => {
		if (!task || type === 'form' || type === 'leave') return;
		fetch(backAction, {
			method: 'POST',
			body: new FormData(),
			keepalive: true,
			redirect: 'manual'
		}).catch(() => {});
	});

	onMount(() => {
		if (phase !== 'shuffle') return;
		const pool = sample.length ? sample : [task!];
		let ticks = 0;
		const timer = setInterval(() => {
			ticks++;
			if (ticks >= SHUFFLE_TICKS) {
				clearInterval(timer);
				phase = 'landed';
				return;
			}
			flick = pool[Math.floor(Math.random() * pool.length)];
		}, SHUFFLE_TICK_MS);
		return () => clearInterval(timer);
	});

	const confetti: Piece[] = [
		{ left: 6, top: 8, w: 14, h: 8, color: 'short', rotate: 24 },
		{ right: 10, top: 0, w: 12, h: 12, color: 'done' },
		{ right: 2, top: 150, w: 16, h: 8, color: 'long', rotate: -30 },
		{ left: 0, top: 200, w: 10, h: 10, color: 'mid' },
		{ left: 40, top: 318, w: 14, h: 7, color: 'primary', rotate: -18 },
		{ right: 44, top: 330, w: 11, h: 11, color: 'short' }
	];

	const submitting = () => {
		busy = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			busy = false;
		};
	};
</script>

<section class="screen reveal">
	<div class="screen-header">
		<form method="POST" action="?/back" use:enhance={submitting}>
			<button class="press icon-btn" aria-label="Back" disabled={busy}>
				<Icon name="back" />
			</button>
		</form>
		<span class="chip" style:background={durationColor(minutes)}>{minutes} min or less</span>
	</div>

	<div class="stage">
		{#if gone}
			<p class="gone pop-in" role="status">Someone else took that one. Here's another.</p>
		{/if}

		<div class="jar">
			<JarArt variant={task ? 'open' : 'closed'} />
		</div>

		{#if task}
			{#if phase === 'shuffle'}
				<div class="card-slot" aria-hidden="true">
					<TaskCard
						class="jiggle"
						label="Shuffling…"
						minutes={flick.minutes}
						title={flick.title}
						tilt={false}
						dim
					/>
				</div>
			{:else}
				<Confetti pieces={confetti} />
				<div class="card-slot">
					<TaskCard class="pop" label="Your task" minutes={task.minutes} title={task.title}>
						<p class="fits">Fits your {minutes} minutes</p>
					</TaskCard>
				</div>
			{/if}
		{:else}
			<div class="nothing">
				<h1 class="disp nothing-title pop-in">
					{afterSkip ? 'Nothing else fits' : 'Nothing fits'} in {minutes} min.
				</h1>
				<p class="break">Enjoy the break!</p>
			</div>
		{/if}
	</div>

	<div class="actions">
		{#if task}
			<form method="POST" class="action-form" use:enhance={submitting}>
				<button
					class="press btn btn-primary"
					formaction="?/take"
					disabled={busy || phase === 'shuffle'}
				>
					<Icon name="check" size={26} stroke={3.2} />Take it
				</button>
				<button class="press btn" formaction="?/skip" disabled={busy || phase === 'shuffle'}>
					<Icon name="skip" size={20} stroke={2.6} />Skip, pull another
				</button>
			</form>
		{:else}
			<a class="press btn btn-done" href={resolve('/')}>Try a longer time</a>
			<a class="press btn" href={resolve('/jar/new')}>Add a quick task</a>
		{/if}
	</div>
</section>

<style>
	.reveal {
		min-height: 100dvh;
		padding-bottom: 28px;
	}

	.chip {
		padding: 9px 16px;
		border: var(--line) solid var(--edge);
		border-radius: 999px;
		color: var(--on-fill);
		font-size: 16px;
		font-weight: 800;
	}

	.stage {
		position: relative;
		flex-grow: 1;
		min-height: 440px;
	}

	.jar {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.card-slot {
		position: absolute;
		top: 24px;
		right: 0;
		left: 0;
		z-index: 2;
		display: flex;
		justify-content: center;
		padding: 0 12px;
	}

	.fits {
		margin-top: 14px;
		color: var(--muted);
		font-size: 15px;
		font-weight: 600;
	}

	.gone {
		position: absolute;
		top: -6px;
		right: 0;
		left: 0;
		z-index: 3;
		color: var(--muted);
		font-size: 15px;
		font-weight: 700;
		text-align: center;
	}

	.nothing {
		position: absolute;
		top: 40px;
		right: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
	}

	.nothing-title {
		max-width: 300px;
		font-size: 36px;
		line-height: 1.05;
		letter-spacing: -0.8px;
	}

	.break {
		color: var(--muted);
		font-size: 20px;
		font-weight: 700;
	}

	.actions,
	.action-form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.actions {
		justify-content: flex-end;
		min-height: 150px;
		margin-top: 12px;
	}

	.btn-primary:disabled,
	.btn:disabled {
		opacity: 1;
	}
</style>
