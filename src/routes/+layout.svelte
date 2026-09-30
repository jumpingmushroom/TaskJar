<script lang="ts">
	import '../app.css';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { markHydrated } from '$lib/client';
	import favicon from '$lib/assets/favicon.svg';
	import TabBar from '$lib/components/TabBar.svelte';

	let { data, children } = $props();

	const TAB_SCREENS = new Set(['/', '/open', '/jar']);
	const showTabs = $derived(TAB_SCREENS.has(page.route.id ?? ''));

	onMount(markHydrated);

	// The jar is shared between devices: refresh when this one comes back into view.
	function onVisibilityChange() {
		if (document.visibilityState === 'visible') invalidateAll();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#FFF4E0" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#17122B" media="(prefers-color-scheme: dark)" />
</svelte:head>

<svelte:document onvisibilitychange={onVisibilityChange} />

<div class="app">
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

	main {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding-top: env(safe-area-inset-top);
	}
</style>
