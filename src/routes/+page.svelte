<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { DRAW_OPTIONS } from '$lib/draw';
	import { durationColor } from '$lib/ui';

	let { data } = $props();

	// Tile styling per button (DESIGN §4): tilt, height and number size grow with time.
	const tiles = DRAW_OPTIONS.map((n, i) => ({
		n,
		rotate: [-1, 0.8, -0.6][i],
		size: ['s', 'm', 'l'][i]
	}));

	let drawing = $state(false);
</script>

<svelte:head>
	<title>TaskJar</title>
</svelte:head>

<section class="screen home">
	<div class="intro">
		<div class="screen-header">
			<Logo />
			<a class="press icon-btn add" href={resolve('/jar/new')} aria-label="Add a task">
				<Icon name="plus" />
			</a>
		</div>
		<h1 class="title headline">How much time do you have?</h1>
		<p class="subline lead">Pick one. We'll pull a task from the jar.</p>
		<div class="pills">
			<span class="pill jar-pill">{data.counts.jar} in the jar</span>
			{#if data.counts.open > 0}
				<a class="press pill open-pill" href={resolve('/open')}>{data.counts.open} open →</a>
			{/if}
		</div>
	</div>

	<form
		method="POST"
		action="?/draw"
		class="tiles"
		use:enhance={() => {
			drawing = true;
			return async ({ update }) => {
				await update();
				drawing = false;
			};
		}}
	>
		{#each tiles as t (t.n)}
			<button
				class="press tile {t.size}"
				name="minutes"
				value={t.n}
				aria-label="Up to {t.n} minutes"
				disabled={drawing}
				style:background={durationColor(t.n)}
				style:--tilt="{t.rotate}deg"
			>
				<span class="disp num" aria-hidden="true">{t.n}</span>
				<span class="unit" aria-hidden="true">
					<span class="disp">min</span>
					<span class="or-less">or less</span>
				</span>
			</button>
		{/each}
	</form>
</section>

<style>
	.home {
		padding-bottom: 28px;
	}

	.add {
		background: var(--surface);
	}

	.headline {
		margin-top: 28px;
	}

	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
		order: 3;
	}

	.jar-pill {
		border: 2px solid var(--pill-jar-border);
		background: var(--pill-jar-bg);
	}

	.open-pill {
		padding: 10px 16px;
		border-width: 2px;
		border-color: var(--pill-open-bg);
		box-shadow: none;
		background: var(--pill-open-bg);
		color: var(--pill-open-fg);
	}

	.open-pill:active {
		transform: translateY(2px) !important;
		box-shadow: none !important;
	}

	/* Phone: headline, tiles, then pills. The intro block is "unwrapped" so the
	   tiles can sit between the subline and the pills. */
	.intro {
		display: contents;
	}

	.tiles {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 24px 0 22px;
		order: 2;
	}

	.screen-header,
	.headline,
	.lead {
		order: 1;
	}

	.tile {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 0 20px 0 22px;
		border-radius: 28px;
		box-shadow: var(--shadow);
		color: var(--on-fill);
		text-align: left;
		transform: rotate(var(--tilt));
	}

	.tile:disabled {
		cursor: progress;
	}

	.tile.s {
		height: 104px;
	}

	.tile.m {
		height: 132px;
	}

	.tile.l {
		height: 164px;
	}

	.num {
		line-height: 0.8;
		letter-spacing: -4px;
	}

	.s .num {
		font-size: 80px;
	}

	.m .num {
		font-size: 96px;
	}

	.l .num {
		font-size: 116px;
	}

	.unit {
		display: flex;
		flex-direction: column;
		line-height: 1.05;
	}

	.unit .disp {
		font-size: 24px;
	}

	.or-less {
		font-size: 14px;
		font-weight: 700;
	}

	/* Tablet / wall panel, landscape (DESIGN §7): intro on the left, the tiles
	   stacked large on the right, sharing the height in the 180:224:268 ratio. */
	@media (min-width: 1024px) and (orientation: landscape) {
		.home {
			display: grid;
			grid-template-columns: 400px 1fr;
			gap: 48px;
			height: 100%;
			padding: 56px;
		}

		.intro {
			display: flex;
			flex-direction: column;
			min-height: 0;
		}

		.intro :global(.logo svg) {
			width: 48px;
			height: 48px;
		}

		.intro :global(.wordmark) {
			font-size: 34px !important;
			letter-spacing: -0.8px;
		}

		.headline {
			margin-top: 64px;
			font-size: 72px;
			line-height: 0.98;
			letter-spacing: -2.5px;
		}

		.lead {
			margin-top: 18px;
			font-size: 22px;
		}

		.pills {
			gap: 12px;
			margin-top: auto;
			padding-top: 24px;
		}

		.pill {
			padding: 14px 20px;
			border-width: 3px;
			font-size: 18px;
		}

		.open-pill {
			padding: 14px 22px;
			border-width: 3px;
		}

		.tiles {
			gap: 18px;
			min-height: 0;
			margin: 0;
		}

		.tile {
			height: auto !important;
			min-height: 120px;
			padding: 0 36px 0 40px;
			border-width: 4px;
			border-radius: 40px;
			box-shadow: var(--shadow-lg);
			gap: 18px;
			transform: rotate(calc(var(--tilt) * 0.6));
		}

		.tile.s {
			flex: 180 1 0;
		}

		.tile.m {
			flex: 224 1 0;
		}

		.tile.l {
			flex: 268 1 0;
		}

		.num {
			letter-spacing: -6px;
		}

		.s .num {
			font-size: 130px;
		}

		.m .num {
			font-size: 156px;
		}

		.l .num {
			font-size: 184px;
		}

		.unit .disp {
			font-size: 36px;
		}

		.or-less {
			font-size: 20px;
		}
	}
</style>
