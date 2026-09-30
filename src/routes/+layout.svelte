<script lang="ts">
	import '../app.css';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { markHydrated } from '$lib/client';
	import favicon from '$lib/assets/favicon.svg';
	import TabBar from '$lib/components/TabBar.svelte';
	import { THEME_COLORS } from '$lib/theme';
	import { setThemeContext } from '$lib/theme-context';

	let { data, children } = $props();

	const TAB_SCREENS = new Set(['/', '/open', '/jar']);
	const showTabs = $derived(TAB_SCREENS.has(page.route.id ?? ''));
	// Home gets the two-column layout on landscape tablets (SPEC §5).
	const wide = $derived(page.route.id === '/');

	// Per request (context, not module state), so SSR never mixes up devices.
	const themeState = $state({ forced: (() => data.theme)() });
	setThemeContext(themeState);

	onMount(markHydrated);

	// The jar is shared between devices: refresh when this one comes back into view.
	function onVisibilityChange() {
		if (document.visibilityState === 'visible') invalidateAll();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if themeState.forced}
		<meta name="theme-color" content={THEME_COLORS[themeState.forced]} />
	{:else}
		<meta name="theme-color" content={THEME_COLORS.light} media="(prefers-color-scheme: light)" />
		<meta name="theme-color" content={THEME_COLORS.dark} media="(prefers-color-scheme: dark)" />
	{/if}
</svelte:head>

<svelte:document onvisibilitychange={onVisibilityChange} />

<div class="app" class:wide>
	<main>
		{@render children()}
	</main>
	{#if showTabs}
		<TabBar openCount={data.counts.open} />
	{/if}
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		min-height: 100dvh;
		margin: 0 auto;
	}

	@media (min-width: 1024px) and (orientation: landscape) {
		.app.wide {
			max-width: none;
			height: 100dvh;
		}
	}

	main {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		min-height: 0;
		padding-top: env(safe-area-inset-top);
	}
</style>
