<script lang="ts" module>
	export type IconName =
		| 'plus'
		| 'back'
		| 'chevron'
		| 'check'
		| 'skip'
		| 'draw'
		| 'open'
		| 'jar'
		| 'split'
		| 'minus'
		| 'sun'
		| 'moon';
</script>

<script lang="ts">
	/** Inline stroke icons from the design. Decorative: label the button instead. */
	let {
		name,
		size = 24,
		stroke = 3,
		color = 'currentColor',
		class: className = ''
	}: {
		name: IconName;
		size?: number;
		stroke?: number;
		color?: string;
		class?: string;
	} = $props();
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'minus'}
		<path d="M5 12h14" />
	{:else if name === 'back'}
		<path d="M15 5l-7 7 7 7" />
	{:else if name === 'chevron'}
		<path d="M9 5l7 7-7 7" />
	{:else if name === 'check'}
		<path d="M5 12.5l4.5 4.5L19 7.5" />
	{:else if name === 'skip'}
		<path
			d="M4 7h3.5c2 0 3.2 1 4.3 2.7l2.4 3.6c1.1 1.7 2.3 2.7 4.3 2.7H20M17 13.5l3 2.5-3 2.5M4 17h3.5c1.3 0 2.2-.4 3-1.1M13.3 8.1c.8-.7 1.7-1.1 3-1.1H20M17 4.5l3 2.5-3 2.5"
		/>
	{:else if name === 'draw'}
		<path d="M11 3l2 5.2 5.2 2-5.2 2L11 17.4l-2-5.2-5.2-2 5.2-2z" />
		<path d="M19 15v5M16.5 17.5h5" />
	{:else if name === 'open'}
		<circle cx="12" cy="12" r="9" />
		<path d="M8 12.5l2.7 2.7L16 9.8" />
	{:else if name === 'jar'}
		<rect x="7" y="2.5" width="10" height="3.5" rx="1" />
		<rect x="5" y="6" width="14" height="15.5" rx="4" />
		<path d="M9 12h6M9 16h4" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4.2" />
		<path
			d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"
		/>
	{:else if name === 'moon'}
		<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
	{:else if name === 'split'}
		<circle cx="6" cy="6" r="3" />
		<circle cx="6" cy="18" r="3" />
		<path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" />
	{/if}
</svg>
