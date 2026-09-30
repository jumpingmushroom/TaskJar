<script lang="ts">
	import type { Snippet } from 'svelte';
	import DurationBadge from './DurationBadge.svelte';

	/** The white hero card for a single task: "Your task", "Shuffling…", "You took". */
	let {
		label,
		minutes,
		title,
		size = 'lg',
		tilt = true,
		dim = false,
		class: className = '',
		children
	}: {
		label: string;
		minutes: number;
		title: string;
		size?: 'lg' | 'md';
		tilt?: boolean;
		/** Faded title, used while shuffling. */
		dim?: boolean;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="card task-card {size} {className}" class:tilt>
	<div class="head">
		<span class="label">{label}</span>
		<DurationBadge {minutes} variant="pill" {size} />
	</div>
	<p class="disp task-title" class:dim>{title}</p>
	{@render children?.()}
</div>

<style>
	.task-card {
		width: 100%;
		max-width: 318px;
		padding: 24px;
		overflow-wrap: anywhere;
	}

	.task-card.md {
		padding: 22px;
	}

	.tilt {
		transform: rotate(-3deg);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.task-title {
		margin-top: 18px;
		font-size: 34px;
		line-height: 1.05;
		letter-spacing: -0.8px;
	}

	.md .task-title {
		margin-top: 14px;
		font-size: 28px;
		line-height: 1.08;
		letter-spacing: -0.6px;
	}

	.dim {
		opacity: 0.35;
	}
</style>
