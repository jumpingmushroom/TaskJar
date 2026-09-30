import { describe, expect, it } from 'vitest';
import { candidates, draw, drawWeight, isDrawMinutes, weightedPick, type Drawable } from './draw';

function task(id: number, minutes: number, status: Drawable['status'] = 'jar'): Drawable {
	return { id, minutes, status };
}

/** Returns the given values in order, so a test controls exactly where the pick lands. */
function sequence(...values: number[]) {
	let i = 0;
	return () => {
		if (i >= values.length) throw new Error('rng called more often than expected');
		return values[i++];
	};
}

/** Small seeded PRNG (mulberry32) for deterministic statistical checks. */
function seeded(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

describe('isDrawMinutes', () => {
	it('accepts only the three time buttons', () => {
		expect([5, 15, 30].every(isDrawMinutes)).toBe(true);
		expect([0, 1, 10, 20, 31, '15', null, undefined, 15.5].some(isDrawMinutes)).toBe(false);
	});
});

describe('drawWeight', () => {
	it('is 0.35 + minutes / N', () => {
		expect(drawWeight(30, 30)).toBeCloseTo(1.35);
		expect(drawWeight(15, 30)).toBeCloseTo(0.85);
		expect(drawWeight(2, 30)).toBeCloseTo(0.35 + 2 / 30);
		expect(drawWeight(5, 5)).toBeCloseTo(1.35);
	});

	it('rejects a non-positive time budget', () => {
		expect(() => drawWeight(5, 0)).toThrow(RangeError);
		expect(() => drawWeight(5, -5)).toThrow(RangeError);
	});
});

describe('candidates', () => {
	const jar = [task(1, 1), task(2, 5), task(3, 6), task(4, 15), task(5, 16), task(6, 30)];

	it('keeps tasks whose duration is at most N, including exactly N', () => {
		expect(candidates(jar, 5).map((t) => t.id)).toEqual([1, 2]);
		expect(candidates(jar, 15).map((t) => t.id)).toEqual([1, 2, 3, 4]);
		expect(candidates(jar, 30).map((t) => t.id)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('ignores tasks that are open or done', () => {
		const mixed = [task(1, 5, 'open'), task(2, 5, 'done'), task(3, 5)];
		expect(candidates(mixed, 5).map((t) => t.id)).toEqual([3]);
	});

	it('leaves out every excluded (skipped) task', () => {
		expect(candidates(jar, 15, [2]).map((t) => t.id)).toEqual([1, 3, 4]);
		expect(candidates(jar, 15, new Set([1, 3, 4])).map((t) => t.id)).toEqual([2]);
	});

	it('is empty when nothing fits', () => {
		expect(candidates([task(1, 20)], 15)).toEqual([]);
		expect(candidates([], 30)).toEqual([]);
		expect(candidates(jar, 5, [1, 2])).toEqual([]);
	});

	it('does not mutate its input', () => {
		const input = [task(1, 5), task(2, 10)];
		const copy = structuredClone(input);
		candidates(input, 5, [1]);
		expect(input).toEqual(copy);
	});
});

describe('weightedPick', () => {
	it('returns null for no candidates, without consuming randomness', () => {
		expect(weightedPick([], 15, sequence())).toBeNull();
	});

	it('returns the only candidate', () => {
		const only = task(7, 3);
		expect(weightedPick([only], 30, sequence(0.99))).toBe(only);
	});

	it('maps the random number onto cumulative weights', () => {
		// N = 30: weights are 0.35 + 5/30 ≈ 0.5167 and 0.35 + 30/30 = 1.35, total ≈ 1.8667.
		const short = task(1, 5);
		const long = task(2, 30);
		const total = drawWeight(5, 30) + drawWeight(30, 30);
		const boundary = drawWeight(5, 30) / total;

		expect(weightedPick([short, long], 30, sequence(0))).toBe(short);
		expect(weightedPick([short, long], 30, sequence(boundary - 1e-9))).toBe(short);
		expect(weightedPick([short, long], 30, sequence(boundary + 1e-9))).toBe(long);
		expect(weightedPick([short, long], 30, sequence(0.999999))).toBe(long);
	});

	it('still returns a candidate if the rng misbehaves and returns 1', () => {
		const list = [task(1, 5), task(2, 10)];
		expect(list).toContain(weightedPick(list, 15, sequence(1)));
	});

	it('picks in proportion to 0.35 + minutes / N over many draws', () => {
		const list = [task(1, 2), task(2, 10), task(3, 20), task(4, 30)];
		const n = 30;
		const rng = seeded(42);
		const runs = 40_000;
		const counts = new Map<number, number>();
		for (let i = 0; i < runs; i++) {
			const picked = weightedPick(list, n, rng)!;
			counts.set(picked.id, (counts.get(picked.id) ?? 0) + 1);
		}
		// Computed by hand, independent of drawWeight: weights 0.35 + {2,10,20,30}/30
		// = 0.4167, 0.6833, 1.0167, 1.35 (total 3.4667).
		const expected = new Map([
			[1, 0.1202],
			[2, 0.1971],
			[3, 0.2933],
			[4, 0.3894]
		]);
		for (const [id, share] of expected) {
			expect((counts.get(id) ?? 0) / runs).toBeCloseTo(share, 2);
		}
	});
});

describe('draw', () => {
	const jar = [task(1, 5), task(2, 10), task(3, 20), task(4, 5, 'open')];

	it('only ever returns a fitting jar task', () => {
		const rng = seeded(7);
		for (let i = 0; i < 500; i++) {
			const picked = draw(jar, 15, { rng })!;
			expect([1, 2]).toContain(picked.id);
		}
	});

	it('excludes skipped tasks and reports nothing else fits once they are used up', () => {
		const rng = seeded(1);
		const skipped: number[] = [];
		const first = draw(jar, 15, { rng })!;
		skipped.push(first.id);
		const second = draw(jar, 15, { exclude: skipped, rng })!;
		expect(second.id).not.toBe(first.id);
		skipped.push(second.id);
		expect(draw(jar, 15, { exclude: skipped, rng })).toBeNull();
	});

	it('returns null when nothing fits', () => {
		expect(draw(jar, 5, { exclude: [1] })).toBeNull();
		expect(draw([], 30)).toBeNull();
	});

	it('defaults to Math.random', () => {
		expect(draw([task(1, 5)], 5)?.id).toBe(1);
	});
});
