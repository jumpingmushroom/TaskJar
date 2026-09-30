/**
 * Draw logic: which tasks fit a time budget, and which one to pull.
 *
 * Pure on purpose: no database, no DOM, and randomness is injected, so the
 * server can use it for real draws and tests can make it deterministic.
 */
import type { TaskStatus } from './task';

/** The time buttons on the home screen, in minutes. Each means "up to N minutes". */
export const DRAW_OPTIONS = [5, 15, 30] as const;
export type DrawMinutes = (typeof DRAW_OPTIONS)[number];

/** The fields the draw needs; real task rows carry more. */
export interface Drawable {
	id: number;
	minutes: number;
	status: TaskStatus;
}

/** Returns a number in [0, 1), like `Math.random`. */
export type Rng = () => number;

export function isDrawMinutes(value: unknown): value is DrawMinutes {
	return DRAW_OPTIONS.includes(value as DrawMinutes);
}

/**
 * How strongly a task is favoured in an N-minute draw. Longer tasks use the
 * time better and weigh more, but the 0.35 floor keeps short ones possible.
 */
export function drawWeight(minutes: number, n: number): number {
	if (!(n > 0)) throw new RangeError(`Draw time must be positive, got ${n}`);
	return 0.35 + minutes / n;
}

/**
 * Tasks in the jar that fit in `n` minutes, minus the ones already skipped in
 * this draw session. Order is preserved.
 */
export function candidates<T extends Drawable>(
	tasks: readonly T[],
	n: number,
	exclude: Iterable<number> = []
): T[] {
	const skipped = new Set(exclude);
	return tasks.filter((t) => t.status === 'jar' && t.minutes <= n && !skipped.has(t.id));
}

/** Weighted random choice among `list`; null when the list is empty. */
export function weightedPick<T extends Drawable>(
	list: readonly T[],
	n: number,
	rng: Rng = Math.random
): T | null {
	if (list.length === 0) return null;
	const weights = list.map((t) => drawWeight(t.minutes, n));
	const total = weights.reduce((sum, w) => sum + w, 0);
	let r = rng() * total;
	for (let i = 0; i < list.length; i++) {
		if (r < weights[i]) return list[i];
		r -= weights[i];
	}
	// Only reachable through floating-point drift or an rng returning 1.
	return list[list.length - 1];
}

export interface DrawOptions {
	/** Task ids skipped earlier in the same draw session. */
	exclude?: Iterable<number>;
	rng?: Rng;
}

/** Pulls one fitting task from the jar, or null when nothing (else) fits. */
export function draw<T extends Drawable>(
	tasks: readonly T[],
	n: number,
	{ exclude, rng }: DrawOptions = {}
): T | null {
	return weightedPick(candidates(tasks, n, exclude), n, rng);
}
