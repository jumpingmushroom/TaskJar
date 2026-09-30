<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { THEME_COOKIE, THEME_COOKIE_MAX_AGE, toggledTheme } from '$lib/theme';
	import { getThemeContext } from '$lib/theme-context';
	import Icon from './Icon.svelte';

	/**
	 * Light/dark switch for this device. The icon is chosen in CSS from the same
	 * rules as the colours, so it is right before JavaScript runs.
	 */
	const themeState = getThemeContext();
	const systemDark = new MediaQuery('(prefers-color-scheme: dark)', false);

	let mounted = $state(false);
	onMount(() => (mounted = true));

	const isDark = $derived(
		(themeState.forced ?? (systemDark.current ? 'dark' : 'light')) === 'dark'
	);
	// Without JavaScript the server can't see the system theme: best guess.
	const fallbackNext = $derived(themeState.forced === 'dark' ? 'light' : 'dark');

	function toggle(event: MouseEvent) {
		event.preventDefault();
		const next = toggledTheme(themeState.forced, systemDark.current);
		themeState.forced = next;
		const root = document.documentElement;
		if (next) {
			root.dataset.theme = next;
			document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
		} else {
			delete root.dataset.theme;
			document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
		}
	}
</script>

<form method="POST" action={resolve('/theme')}>
	<button
		class="press icon-btn theme-toggle"
		name="theme"
		value={fallbackNext}
		aria-label="Dark mode"
		aria-pressed={mounted ? isDark : undefined}
		title={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
		onclick={toggle}
	>
		<span class="moon"><Icon name="moon" stroke={2.6} /></span>
		<span class="sun"><Icon name="sun" stroke={2.6} /></span>
	</button>
</form>

<style>
	.theme-toggle {
		background: var(--surface);
	}

	.moon,
	.sun {
		display: flex;
	}

	/* Light on screen: offer the moon. Dark on screen: offer the sun. */
	.sun {
		display: none;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme='light'])) .sun {
			display: flex;
		}

		:global(:root:not([data-theme='light'])) .moon {
			display: none;
		}
	}

	:global(:root[data-theme='dark']) .sun {
		display: flex;
	}

	:global(:root[data-theme='dark']) .moon {
		display: none;
	}
</style>
