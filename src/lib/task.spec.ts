import { describe, expect, it } from 'vitest';
import { isTooBig, validateTask } from './task';

describe('validateTask', () => {
	it('accepts a trimmed title and whole minutes from 1 to 30', () => {
		expect(validateTask({ title: '  Water the plants ', minutes: 5 })).toEqual({
			ok: true,
			value: { title: 'Water the plants', minutes: 5 }
		});
		expect(validateTask({ title: 'a', minutes: 1 }).ok).toBe(true);
		expect(validateTask({ title: 'a', minutes: 30 }).ok).toBe(true);
	});

	it('parses minutes from form strings', () => {
		expect(validateTask({ title: 'a', minutes: '15' })).toEqual({
			ok: true,
			value: { title: 'a', minutes: 15 }
		});
	});

	it('enforces the 30-minute rule', () => {
		expect(validateTask({ title: 'a', minutes: 31 })).toEqual({
			ok: false,
			errors: { minutes: 'too_big' }
		});
		expect(validateTask({ title: 'a', minutes: '45' })).toEqual({
			ok: false,
			errors: { minutes: 'too_big' }
		});
	});

	it('rejects durations that are not whole positive minutes', () => {
		for (const minutes of [0, -5, 2.5, NaN, Infinity, '', '10min', '1e1', null, undefined]) {
			expect(validateTask({ title: 'a', minutes })).toEqual({
				ok: false,
				errors: { minutes: 'minutes_invalid' }
			});
		}
	});

	it('requires a title', () => {
		for (const title of ['', '   ', undefined, 42]) {
			expect(validateTask({ title, minutes: 5 })).toEqual({
				ok: false,
				errors: { title: 'title_required' }
			});
		}
	});

	it('caps the title length', () => {
		expect(validateTask({ title: 'x'.repeat(120), minutes: 5 }).ok).toBe(true);
		expect(validateTask({ title: 'x'.repeat(121), minutes: 5 })).toEqual({
			ok: false,
			errors: { title: 'title_too_long' }
		});
	});

	it('reports both fields at once', () => {
		expect(validateTask({ title: '', minutes: 60 })).toEqual({
			ok: false,
			errors: { title: 'title_required', minutes: 'too_big' }
		});
	});
});

describe('isTooBig', () => {
	it('is true only above 30', () => {
		expect(isTooBig(30)).toBe(false);
		expect(isTooBig(31)).toBe(true);
	});
});
