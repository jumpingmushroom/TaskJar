import { describe, expect, it } from 'vitest';
import { durationBand, durationColor, stepDown, stepUp } from './ui';

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
