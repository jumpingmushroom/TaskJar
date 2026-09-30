<script lang="ts">
	/** The mini jar logo with the wordmark. */
	let { size = 36, wordmark = true }: { size?: number; wordmark?: boolean } = $props();
</script>

<span class="logo">
	<svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
		<g stroke="var(--edge)">
			<rect x="10" y="2.5" width="16" height="6" rx="2" fill="var(--primary)" stroke-width="2.5" />
			<rect
				x="6"
				y="8.5"
				width="24"
				height="25"
				rx="7"
				fill="var(--jar-glass)"
				stroke-width="2.5"
			/>
			<rect
				x="10"
				y="20"
				width="8"
				height="6"
				rx="1.5"
				fill="var(--dur-short)"
				stroke-width="2"
				transform="rotate(-12 14 23)"
			/>
			<rect
				x="17"
				y="21"
				width="9"
				height="6"
				rx="1.5"
				fill="var(--dur-long)"
				stroke-width="2"
				transform="rotate(10 21 24)"
			/>
			<rect
				x="13"
				y="14"
				width="8"
				height="5.5"
				rx="1.5"
				fill="var(--dur-mid)"
				stroke-width="2"
				transform="rotate(6 17 17)"
			/>
		</g>
	</svg>
	{#if wordmark}<span class="disp wordmark" style:font-size="{size * 0.72}px">TaskJar</span>{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}

	.wordmark {
		letter-spacing: -0.5px;
	}
</style>
