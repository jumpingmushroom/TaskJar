import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { openDb, type Db } from './db';
import { draw, task } from './db/schema';
import {
	abandonDraw,
	DrawStateError,
	expireStaleDraws,
	skipDraw,
	STALE_DRAW_MS,
	startDraw,
	takeDraw
} from './draws';
import { createTask, deleteTask, getTask } from './tasks';

let db: Db;

beforeEach(() => {
	db = openDb(':memory:');
});

const drawRow = (id: number) => db.select().from(draw).where(eq(draw.id, id)).get()!;

describe('startDraw', () => {
	it('pulls a fitting jar task and logs a pending draw', () => {
		createTask(db, { title: 'Long', minutes: 20 });
		const short = createTask(db, { title: 'Short', minutes: 5 });
		const result = startDraw(db, 15);
		expect(result.task?.id).toBe(short.id);
		expect(result.afterSkip).toBe(false);
		expect(drawRow(result.drawId)).toMatchObject({
			sessionId: result.sessionId,
			minutesSelected: 15,
			taskId: short.id,
			outcome: 'pending',
			resolvedAt: null
		});
	});

	it('logs an empty draw when nothing fits', () => {
		createTask(db, { title: 'Long', minutes: 20 });
		const result = startDraw(db, 5);
		expect(result.task).toBeNull();
		expect(drawRow(result.drawId)).toMatchObject({ taskId: null, outcome: 'empty' });
		expect(drawRow(result.drawId).resolvedAt).toBeInstanceOf(Date);
	});

	it('uses the injected rng for the weighted pick', () => {
		const a = createTask(db, { title: 'A', minutes: 5 });
		const b = createTask(db, { title: 'B', minutes: 5 });
		expect(startDraw(db, 5, { rng: () => 0 }).task?.id).toBe(a.id);
		expect(startDraw(db, 5, { rng: () => 0.99 }).task?.id).toBe(b.id);
	});

	it('starts a new session each time', () => {
		createTask(db, { title: 'A', minutes: 5 });
		expect(startDraw(db, 5).sessionId).not.toBe(startDraw(db, 5).sessionId);
	});
});

describe('skipDraw', () => {
	it('excludes every task skipped in the session and counts skips', () => {
		const ids = ['A', 'B', 'C'].map((title) => createTask(db, { title, minutes: 5 }).id);
		const first = startDraw(db, 5);
		const second = skipDraw(db, first.drawId);
		const third = skipDraw(db, second.drawId);
		const seen = [first, second, third].map((r) => r.task!.id);
		expect(new Set(seen)).toEqual(new Set(ids));
		expect(second.sessionId).toBe(first.sessionId);
		expect(third.afterSkip).toBe(true);

		const last = skipDraw(db, third.drawId);
		expect(last.task).toBeNull();
		expect(last.afterSkip).toBe(true);
		expect(drawRow(last.drawId).outcome).toBe('empty');
		expect(ids.map((id) => getTask(db, id)!.skipCount)).toEqual([1, 1, 1]);
		expect(drawRow(first.drawId).outcome).toBe('skipped');
	});

	it('does not carry exclusions into a new session', () => {
		const a = createTask(db, { title: 'A', minutes: 5 });
		const first = startDraw(db, 5);
		expect(skipDraw(db, first.drawId).task).toBeNull();
		expect(startDraw(db, 5).task?.id).toBe(a.id);
	});

	it('refuses a draw that is no longer pending', () => {
		createTask(db, { title: 'A', minutes: 5 });
		createTask(db, { title: 'B', minutes: 5 });
		const first = startDraw(db, 5);
		skipDraw(db, first.drawId);
		expect(() => skipDraw(db, first.drawId)).toThrow(DrawStateError);
		expect(() => skipDraw(db, 999)).toThrow(DrawStateError);
	});
});

describe('takeDraw', () => {
	it('moves the task from the jar to open', () => {
		createTask(db, { title: 'A', minutes: 5 });
		const result = startDraw(db, 5);
		const now = new Date('2026-09-30T08:00:00Z');
		const taken = takeDraw(db, result.drawId, now);
		expect(taken).toMatchObject({ ok: true, task: { status: 'open', takenAt: now } });
		expect(drawRow(result.drawId).outcome).toBe('taken');
		expect(() => takeDraw(db, result.drawId)).toThrow(DrawStateError);
	});

	it('reports gone when another device took the task first', () => {
		createTask(db, { title: 'A', minutes: 5 });
		const phone = startDraw(db, 5);
		const tablet = startDraw(db, 5);
		expect(takeDraw(db, tablet.drawId).ok).toBe(true);
		expect(takeDraw(db, phone.drawId)).toEqual({ ok: false, reason: 'gone' });
		expect(drawRow(phone.drawId).outcome).toBe('abandoned');
	});

	it('reports gone when the task was deleted', () => {
		const t = createTask(db, { title: 'A', minutes: 5 });
		const result = startDraw(db, 5);
		deleteTask(db, t.id);
		expect(drawRow(result.drawId).taskId).toBeNull();
		expect(takeDraw(db, result.drawId)).toEqual({ ok: false, reason: 'gone' });
	});
});

describe('abandonDraw and expireStaleDraws', () => {
	it('abandons only pending draws', () => {
		createTask(db, { title: 'A', minutes: 5 });
		const pending = startDraw(db, 5);
		abandonDraw(db, pending.drawId);
		expect(drawRow(pending.drawId).outcome).toBe('abandoned');

		const taken = startDraw(db, 5);
		takeDraw(db, taken.drawId);
		abandonDraw(db, taken.drawId);
		expect(drawRow(taken.drawId).outcome).toBe('taken');
	});

	it('expires pending draws older than the cutoff', () => {
		createTask(db, { title: 'A', minutes: 5 });
		const t0 = new Date('2026-09-30T08:00:00Z');
		const old = startDraw(db, 5, { now: t0 });
		const recent = startDraw(db, 5, { now: new Date(t0.getTime() + STALE_DRAW_MS) });
		expect(expireStaleDraws(db, new Date(t0.getTime() + STALE_DRAW_MS + 1))).toBe(1);
		expect(drawRow(old.drawId).outcome).toBe('abandoned');
		expect(drawRow(recent.drawId).outcome).toBe('pending');
	});

	it('expires stale draws when a new session starts', () => {
		createTask(db, { title: 'A', minutes: 5 });
		const t0 = new Date('2026-09-30T08:00:00Z');
		const old = startDraw(db, 5, { now: t0 });
		startDraw(db, 5, { now: new Date(t0.getTime() + STALE_DRAW_MS + 1) });
		expect(drawRow(old.drawId).outcome).toBe('abandoned');
		expect(db.select().from(task).all()).toHaveLength(1);
	});
});
