<script lang="ts" module>
	/** One confetti piece, positioned absolutely inside the nearest positioned parent. */
	export interface Piece {
		left?: number;
		right?: number;
		top?: number;
		bottom?: number;
		w: number;
		h: number;
		color: 'short' | 'mid' | 'long' | 'primary' | 'done' | 'surface';
		rotate?: number;
	}

	const fills: Record<Piece['color'], string> = {
		short: 'var(--dur-short)',
		mid: 'var(--dur-mid)',
		long: 'var(--dur-long)',
		primary: 'var(--primary)',
		done: 'var(--done)',
		surface: 'var(--surface)'
	};

	const px = (n: number | undefined) => (n === undefined ? undefined : `${n}px`);
</script>

<script lang="ts">
	/** Decorative confetti: small rounded rectangles and dots with ink outlines. */
	let { pieces }: { pieces: Piece[] } = $props();
</script>

<div class="confetti" aria-hidden="true">
	{#each pieces as p, i (i)}
		<span
			style:left={px(p.left)}
			style:right={px(p.right)}
			style:top={px(p.top)}
			style:bottom={px(p.bottom)}
			style:width={px(p.w)}
			style:height={px(p.h)}
			style:border-radius={p.w === p.h ? '50%' : '3px'}
			style:background={fills[p.color]}
			style:transform={p.rotate ? `rotate(${p.rotate}deg)` : undefined}
		></span>
	{/each}
</div>

<style>
	.confetti {
		display: contents;
	}

	span {
		position: absolute;
		border: 2px solid var(--edge);
		pointer-events: none;
	}
</style>
