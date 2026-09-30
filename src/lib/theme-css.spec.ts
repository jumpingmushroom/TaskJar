import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** app.css defines the dark tokens twice (system dark, forced dark); they must not drift. */
describe('dark theme tokens', () => {
	it('are identical for the system and the forced dark theme', () => {
		const css = readFileSync('src/app.css', 'utf8');
		const system = css.match(/:root:not\(\[data-theme='light'\]\) \{([^}]*)\}/)?.[1];
		const forced = css.match(/:root\[data-theme='dark'\] \{([^}]*)\}/)?.[1];
		const normalise = (s = '') => s.replace(/\s+/g, ' ').trim();
		expect(normalise(system)).not.toBe('');
		expect(normalise(system)).toBe(normalise(forced));
	});
});
