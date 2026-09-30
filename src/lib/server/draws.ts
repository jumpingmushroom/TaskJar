/**
 * Draw sessions: pressing a time button starts a session, each skip adds a
 * draw to it, and "Take it" moves the drawn task from the jar to open. Every
 * pull is logged in the `draw` table.
 */
import { and, eq, lt, sql } from 'drizzle-orm';
import { draw as pick, type DrawMinutes, type Rng } from '../draw';
import type { Db } from './db';
import { draw, task, type Task } from './db/schema';

/** Pending draws older than this are treated as abandoned. */
export const STALE_DRAW_MS = 60 * 60 * 1000;

export interface DrawResult {
	drawId: number;
	sessionId: string;
	minutes: DrawMinutes;
	/** The drawn task, or null when nothing (else) fits. */
	task: Task | null;
	/** True when this pull followed a skip, so an empty result reads "Nothing else fits". */
	afterSkip: boolean;
}

export class DrawStateError extends Error {
	constructor(readonly drawId: number) {
		super(`Draw ${drawId} is not pending`);
		this.name = 'DrawStateError';
	}
}

export type TakeResult = { ok: true; task: Task } | { ok: false; reason: 'gone' };

interface Options {
	rng?: Rng;
	now?: Date;
}

function pull(
	db: Db,
	minutes: DrawMinutes,
	sessionId: string,
	afterSkip: boolean,
	{ rng, now = new Date() }: Options
): DrawResult {
	const skipped = db
		.select({ taskId: draw.taskId })
		.from(draw)
		.where(and(eq(draw.sessionId, sessionId), eq(draw.outcome, 'skipped')))
		.all()
		.flatMap((r) => (r.taskId === null ? [] : [r.taskId]));
	const jar = db.select().from(task).where(eq(task.status, 'jar')).all();
	const picked = pick(jar, minutes, { exclude: skipped, rng });

	const row = db
		.insert(draw)
		.values({
			sessionId,
			minutesSelected: minutes,
			taskId: picked?.id ?? null,
			outcome: picked ? 'pending' : 'empty',
			createdAt: now,
			resolvedAt: picked ? null : now
		})
		.returning({ id: draw.id })
		.get();

	return { drawId: row.id, sessionId, minutes, task: picked, afterSkip };
}

/** Starts a draw session for a time button. */
export function startDraw(db: Db, minutes: DrawMinutes, options: Options = {}): DrawResult {
	return db.transaction(() => {
		expireStaleDraws(db, options.now);
		return pull(db, minutes, crypto.randomUUID(), false, options);
	});
}

function pendingDraw(db: Db, drawId: number) {
	const row = db.select().from(draw).where(eq(draw.id, drawId)).get();
	if (!row || row.outcome !== 'pending') throw new DrawStateError(drawId);
	return row;
}

/** Skips the current task and pulls another from the same session. */
export function skipDraw(db: Db, drawId: number, options: Options = {}): DrawResult {
	const now = options.now ?? new Date();
	return db.transaction(() => {
		const current = pendingDraw(db, drawId);
		db.update(draw).set({ outcome: 'skipped', resolvedAt: now }).where(eq(draw.id, drawId)).run();
		if (current.taskId !== null) {
			db.update(task)
				.set({ skipCount: sql`${task.skipCount} + 1` })
				.where(eq(task.id, current.taskId))
				.run();
		}
		return pull(db, current.minutesSelected as DrawMinutes, current.sessionId, true, {
			...options,
			now
		});
	});
}

/**
 * Takes the drawn task: jar → open. Fails with `gone` when the task left the
 * jar in the meantime (taken on another device, or deleted).
 */
export function takeDraw(db: Db, drawId: number, now = new Date()): TakeResult {
	return db.transaction(() => {
		const current = pendingDraw(db, drawId);
		const taken =
			current.taskId === null
				? undefined
				: db
						.update(task)
						.set({ status: 'open', takenAt: now, updatedAt: now })
						.where(and(eq(task.id, current.taskId), eq(task.status, 'jar')))
						.returning()
						.get();
		db.update(draw)
			.set({ outcome: taken ? 'taken' : 'abandoned', resolvedAt: now })
			.where(eq(draw.id, drawId))
			.run();
		return taken ? { ok: true, task: taken } : { ok: false, reason: 'gone' };
	});
}

/** Marks a pending draw as abandoned (Back, or leaving the reveal). No-op otherwise. */
export function abandonDraw(db: Db, drawId: number, now = new Date()): void {
	db.update(draw)
		.set({ outcome: 'abandoned', resolvedAt: now })
		.where(and(eq(draw.id, drawId), eq(draw.outcome, 'pending')))
		.run();
}

/** Resolves pending draws that nobody finished as abandoned. */
export function expireStaleDraws(db: Db, now = new Date()): number {
	return db
		.update(draw)
		.set({ outcome: 'abandoned', resolvedAt: now })
		.where(
			and(eq(draw.outcome, 'pending'), lt(draw.createdAt, new Date(now.getTime() - STALE_DRAW_MS)))
		)
		.run().changes;
}
