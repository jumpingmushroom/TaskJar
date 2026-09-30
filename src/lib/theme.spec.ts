import { describe, expect, it } from 'vitest';
import { parseTheme, toggledTheme } from './theme';

describe('parseTheme', () => {
	it('accepts only light and dark', () => {
		expect(parseTheme('light')).toBe('light');
		expect(parseTheme('dark')).toBe('dark');
		expect([undefined, '', 'system', 'DARK', 1].map(parseTheme)).toEqual([
			null,
			null,
			null,
			null,
			null
		]);
	});
});

describe('toggledTheme', () => {
	it('forces the opposite of the system theme when following the system', () => {
		expect(toggledTheme(null, true)).toBe('light');
		expect(toggledTheme(null, false)).toBe('dark');
	});

	it('goes back to following the system when toggled again', () => {
		expect(toggledTheme('light', true)).toBeNull();
		expect(toggledTheme('dark', false)).toBeNull();
	});

	it('flips a forced theme that matches the system', () => {
		expect(toggledTheme('dark', true)).toBe('light');
		expect(toggledTheme('light', false)).toBe('dark');
	});
});
