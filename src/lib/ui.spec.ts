import { describe, expect, it } from 'vitest';
import { durationBand, durationColor, stepDown, stepUp, takenLabel } from './ui';

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

describe('stepper', () => {
	it('steps by 1 below 5 and by 5 above', () => {
		expect([1, 4, 5, 10, 30].map(stepUp)).toEqual([2, 5, 10, 15, 35]);
		expect([1, 2, 5, 6, 10, 35].map(stepDown)).toEqual([1, 1, 4, 1, 5, 30]);
	});

	it('caps the stepper at 60', () => {
		expect(stepUp(60)).toBe(60);
	});
});

describe('takenLabel', () => {
	const now = new Date(2026, 8, 30, 9, 0);

	it('counts calendar days, not 24-hour periods', () => {
		expect(takenLabel(new Date(2026, 8, 30, 0, 5), now)).toBe('Taken today');
		expect(takenLabel(new Date(2026, 8, 29, 23, 55), now)).toBe('Taken yesterday');
		expect(takenLabel(new Date(2026, 8, 29, 0, 1), now)).toBe('Taken yesterday');
		expect(takenLabel(new Date(2026, 8, 27, 12, 0), now)).toBe('Taken 3 days ago');
	});

	it('treats clock skew into the future as today', () => {
		expect(takenLabel(new Date(2026, 8, 30, 9, 1), now)).toBe('Taken today');
	});
});
