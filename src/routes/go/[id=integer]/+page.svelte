<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import Confetti, { type Piece } from '$lib/components/Confetti.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';

	let { data } = $props();

	/** How long Go! stays up before moving on to Open tasks (SPEC §4.5). */
	const GO_MS = 1800;

	onMount(() => {
		const timer = setTimeout(
			() => goto(resolve('/open'), { replaceState: true, state: { highlight: data.task.id } }),
			GO_MS
		);
		return () => clearTimeout(timer);
	});

	const confetti: Piece[] = [
		{ left: 30, top: 70, w: 16, h: 9, color: 'short', rotate: 24 },
		{ right: 36, top: 54, w: 13, h: 13, color: 'mid' },
		{ right: 26, top: 250, w: 16, h: 8, color: 'long', rotate: -30 },
		{ left: 20, top: 300, w: 12, h: 12, color: 'surface' },
		{ left: 56, top: 560, w: 15, h: 8, color: 'done', rotate: -18 },
		{ right: 60, top: 590, w: 11, h: 11, color: 'short' }
	];
</script>

<svelte:head>
	<title>Go! · TaskJar</title>
</svelte:head>

<section class="screen go">
	<Confetti pieces={confetti} />
	<h1 class="disp go-word">Go!</h1>
	<TaskCard
		class="pop go-card"
		label="You took"
		size="md"
		minutes={data.task.minutes}
		title={data.task.title}
	/>
	<p class="disp luck">Good luck!</p>
	<div class="spacer"></div>
	<a class="press btn see-open" href="{resolve('/open')}?highlight={data.task.id}"
		>See open tasks →</a
	>
	<div class="track" aria-hidden="true"><div class="bar"></div></div>
</section>

<style>
	.go {
		position: relative;
		align-items: center;
		min-height: 100dvh;
		padding: 28px var(--gutter);
		overflow: hidden;
	}

	.go-word {
		margin-top: 70px;
		font-size: 136px;
		line-height: 0.9;
		letter-spacing: -6px;
	}

	.go :global(.go-card) {
		margin-top: 36px;
	}

	.luck {
		margin-top: 40px;
		font-size: 30px;
		letter-spacing: -0.5px;
	}

	.spacer {
		flex-grow: 1;
		min-height: 24px;
	}

	.see-open {
		min-height: 60px;
		box-shadow: 0 5px 0 var(--edge);
		font-weight: 800;
	}

	.track {
		width: 100%;
		height: 8px;
		margin-top: 16px;
		overflow: hidden;
		border-radius: 4px;
		background: var(--track);
	}

	.bar {
		height: 8px;
		border-radius: 4px;
		background: var(--text);
	}
</style>
