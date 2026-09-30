<script lang="ts">
	/**
	 * The jar illustration: `open` has the lid popped off (reveal), `closed`
	 * has the lid on and a small smiley (nothing fits).
	 */
	let { variant = 'open', width = 200 }: { variant?: 'open' | 'closed'; width?: number } = $props();
</script>

<svg {width} height={width * 0.95} viewBox="0 0 240 228" aria-hidden="true">
	<g stroke="var(--edge)">
		{#if variant === 'open'}
			<rect
				x="150"
				y="6"
				width="84"
				height="24"
				rx="8"
				fill="var(--primary)"
				stroke-width="5"
				transform="rotate(24 192 18)"
			/>
		{/if}
		<path
			d="M52 60 Q52 46 66 46 H174 Q188 46 188 60 V190 Q188 220 158 220 H82 Q52 220 52 190 Z"
			fill="var(--jar-glass)"
			stroke-width="5"
		/>
		<rect x="46" y="38" width="148" height="18" rx="7" fill="var(--jar-glass)" stroke-width="5" />
		{#if variant === 'open'}
			<g stroke-width="4">
				<rect
					x="68"
					y="168"
					width="48"
					height="30"
					rx="6"
					fill="var(--dur-short)"
					transform="rotate(-12 92 183)"
				/>
				<rect
					x="120"
					y="172"
					width="50"
					height="30"
					rx="6"
					fill="var(--dur-mid)"
					transform="rotate(9 145 187)"
				/>
				<rect
					x="94"
					y="136"
					width="50"
					height="30"
					rx="6"
					fill="var(--dur-long)"
					transform="rotate(5 119 151)"
				/>
				<rect
					x="134"
					y="120"
					width="40"
					height="28"
					rx="6"
					fill="var(--done)"
					transform="rotate(-15 154 134)"
				/>
				<rect
					x="66"
					y="124"
					width="38"
					height="28"
					rx="6"
					fill="var(--done)"
					transform="rotate(14 85 138)"
				/>
				<rect
					x="100"
					y="94"
					width="42"
					height="26"
					rx="6"
					fill="var(--dur-short)"
					transform="rotate(-8 121 107)"
				/>
			</g>
			<path d="M68 72 V104" stroke-width="5" stroke-linecap="round" opacity="0.12" />
		{:else}
			<rect x="62" y="14" width="116" height="26" rx="8" fill="var(--primary)" stroke-width="5" />
			<g stroke-width="4">
				<rect
					x="72"
					y="166"
					width="54"
					height="32"
					rx="6"
					fill="var(--dur-long)"
					transform="rotate(-10 99 182)"
				/>
				<rect
					x="118"
					y="170"
					width="54"
					height="32"
					rx="6"
					fill="var(--dur-mid)"
					transform="rotate(8 145 186)"
				/>
			</g>
			<g fill="none" stroke="var(--on-fill)" stroke-width="4" stroke-linecap="round">
				<path d="M96 104 q8 -8 16 0 M128 104 q8 -8 16 0" />
				<path d="M110 130 q10 6 20 0" />
			</g>
		{/if}
	</g>
</svg>
