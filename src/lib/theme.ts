/** Light/dark theme choice, stored per device in a cookie. No cookie = follow the system. */

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Browser UI colour (theme-color) per theme: the page background. */
export const THEME_COLORS: Record<Theme, string> = { light: '#FFF4E0', dark: '#17122B' };

export function parseTheme(value: unknown): Theme | null {
	return value === 'light' || value === 'dark' ? value : null;
}

/**
 * The choice to store after pressing the toggle: the opposite of what is on
 * screen, or null ("follow the system" again) when that equals the system theme.
 */
export function toggledTheme(forced: Theme | null, systemDark: boolean): Theme | null {
	const system: Theme = systemDark ? 'dark' : 'light';
	const next: Theme = (forced ?? system) === 'dark' ? 'light' : 'dark';
	return next === system ? null : next;
}
