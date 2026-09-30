<script lang="ts">
	import { durationColor } from '$lib/ui';

	/**
	 * Coloured duration badge. `tile` is the square list badge (60px on Open,
	 * 48px in the jar); `pill` is the inline form on task cards.
	 */
	let {
		minutes,
		variant = 'tile',
		size = 'lg'
	}: { minutes: number; variant?: 'tile' | 'pill'; size?: 'lg' | 'md' } = $props();
</script>

<span
	class="badge {variant} {size}"
	style:background={durationColor(minutes)}
	aria-label="{minutes} min"
	role="img"
>
	<span class="disp num" aria-hidden="true">{minutes}</span>
	<span class="unit" class:disp={variant === 'pill'} aria-hidden="true">min</span>
</span>

<style>
	.badge {
		display: flex;
		flex-shrink: 0;
		border: var(--line) solid var(--edge);
		color: var(--on-fill);
	}

	.num {
		line-height: 1;
	}

	.unit {
		font-weight: 800;
	}

	.tile {
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.tile.lg {
		width: 60px;
		height: 60px;
		border-radius: 16px;
	}

	.tile.lg .num {
		font-size: 26px;
	}

	.tile.lg .unit {
		font-size: 11px;
	}

	.tile.md {
		width: 48px;
		height: 48px;
		border-radius: 14px;
	}

	.tile.md .num {
		font-size: 21px;
	}

	.tile.md .unit {
		font-size: 10px;
	}

	.pill {
		align-items: baseline;
		gap: 4px;
	}

	.pill.lg {
		padding: 6px 14px;
		border-radius: 16px;
	}

	.pill.lg .num {
		font-size: 40px;
		letter-spacing: -1.5px;
	}

	.pill.lg .unit {
		font-size: 16px;
	}

	.pill.md {
		padding: 5px 12px;
		border-radius: 14px;
	}

	.pill.md .num {
		font-size: 30px;
		letter-spacing: -1px;
	}

	.pill.md .unit {
		font-size: 14px;
	}
</style>
