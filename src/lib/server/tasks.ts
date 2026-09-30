/**
 * Task repository. All task reads and writes go through here, so profiles and
 * auth can later be added in one place.
 */
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';
import { validateTask, type TaskErrors } from '../task';
import type { Db } from './db';
import { task, type Task } from './db/schema';

export class TaskValidationError extends Error {
	constructor(readonly errors: TaskErrors) {
		super('Invalid task');
		this.name = 'TaskValidationError';
	}
}

/** The task doesn't exist, or isn't in the state the action needs. */
export class TaskNotFoundError extends Error {
	constructor(readonly id: number) {
		super(`Task ${id} not found`);
		this.name = 'TaskNotFoundError';
	}
}

function validOrThrow(raw: { title?: unknown; minutes?: unknown }) {
	const result = validateTask(raw);
	if (!result.ok) throw new TaskValidationError(result.errors);
	return result.value;
}

/** Tasks in the jar, sorted by duration and then title. */
export function listJar(db: Db): Task[] {
	return db
		.select()
		.from(task)
		.where(eq(task.status, 'jar'))
		.orderBy(asc(task.minutes), sql`${task.title} COLLATE NOCASE`, asc(task.id))
		.all();
}

/** Open tasks, most recently taken first. */
export function listOpen(db: Db): Task[] {
	return db
		.select()
		.from(task)
		.where(eq(task.status, 'open'))
		.orderBy(desc(task.takenAt), desc(task.id))
		.all();
}

export function countTasks(db: Db): { jar: number; open: number } {
	const rows = db.select({ status: task.status, n: count() }).from(task).groupBy(task.status).all();
	const by = Object.fromEntries(rows.map((r) => [r.status, r.n]));
	return { jar: by.jar ?? 0, open: by.open ?? 0 };
}

export function getTask(db: Db, id: number): Task | undefined {
	return db.select().from(task).where(eq(task.id, id)).get();
}

export function createTask(db: Db, raw: { title?: unknown; minutes?: unknown }): Task {
	const value = validOrThrow(raw);
	return db.insert(task).values(value).returning().get();
}

/** Edits a task in the jar. Editing open or done tasks isn't part of the MVP. */
export function updateTask(db: Db, id: number, raw: { title?: unknown; minutes?: unknown }): Task {
	const value = validOrThrow(raw);
	const updated = db
		.update(task)
		.set({ ...value, updatedAt: new Date() })
		.where(and(eq(task.id, id), eq(task.status, 'jar')))
		.returning()
		.get();
	if (!updated) throw new TaskNotFoundError(id);
	return updated;
}

/** Deletes a task from the jar. Open and done tasks are kept. */
export function deleteTask(db: Db, id: number): void {
	const deleted = db
		.delete(task)
		.where(and(eq(task.id, id), eq(task.status, 'jar')))
		.returning({ id: task.id })
		.get();
	if (!deleted) throw new TaskNotFoundError(id);
}

/** Marks an open task as done. The record is kept (SPEC §3). */
export function completeTask(db: Db, id: number, now = new Date()): Task {
	const done = db
		.update(task)
		.set({ status: 'done', doneAt: now, updatedAt: now })
		.where(and(eq(task.id, id), eq(task.status, 'open')))
		.returning()
		.get();
	if (!done) throw new TaskNotFoundError(id);
	return done;
}
