<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon, { type IconName } from './Icon.svelte';

	let { openCount }: { openCount: number } = $props();

	const tabs: { href: '/' | '/open' | '/jar'; label: string; icon: IconName }[] = [
		{ href: '/', label: 'Draw', icon: 'draw' },
		{ href: '/open', label: 'Open', icon: 'open' },
		{ href: '/jar', label: 'Jar', icon: 'jar' }
	];

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<nav aria-label="Sections">
	{#each tabs as tab (tab.href)}
		<a href={resolve(tab.href)} aria-current={isActive(tab.href) ? 'page' : undefined}>
			<Icon name={tab.icon} stroke={2.4} />
			{tab.label}
			{#if tab.href === '/open' && openCount > 0}
				<span class="count" aria-label="{openCount} open">{openCount}</span>
			{/if}
		</a>
	{/each}
</nav>

<style>
	nav {
		position: sticky;
		bottom: 0;
		z-index: 10;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-around;
		height: calc(var(--tabbar-height) + env(safe-area-inset-bottom));
		padding: 0 12px calc(6px + env(safe-area-inset-bottom));
		border-top: var(--line) solid var(--edge);
		background: var(--surface);
	}

	a {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		width: 96px;
		height: 58px;
		border-radius: 18px;
		color: var(--text);
		font-size: 13px;
		font-weight: 800;
		text-decoration: none;
	}

	a[aria-current='page'] {
		background: var(--tab-active-bg);
		color: var(--tab-active-fg);
	}

	.count {
		position: absolute;
		top: 2px;
		right: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 22px;
		padding: 0 5px;
		border: 2px solid var(--edge);
		border-radius: 11px;
		background: var(--dur-long);
		color: var(--on-fill);
		font-size: 12px;
		font-weight: 800;
	}
</style>
