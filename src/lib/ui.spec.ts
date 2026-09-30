import { describe, expect, it } from 'vitest';
import { durationBand, durationColor } from './ui';

describe('durationBand', () => {
	it('uses yellow up to 5, blue up to 15 and pink above', () => {
		expect([1, 5].map(durationBand)).toEqual(['short', 'short']);
		expect([6, 15].map(durationBand)).toEqual(['mid', 'mid']);
		expect([16, 30].map(durationBand)).toEqual(['long', 'long']);
	});

	it('maps to the matching colour token', () => {
		expect(durationColor(15)).toBe('var(--dur-mid)');
	});
});
