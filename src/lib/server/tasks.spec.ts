import { beforeEach, describe, expect, it } from 'vitest';
import { openDb, type Db } from './db';
import { task } from './db/schema';
import {
	completeTask,
	countTasks,
	createTask,
	deleteTask,
	getTask,
	listJar,
	listOpen,
	TaskNotFoundError,
	TaskValidationError,
	updateTask
} from './tasks';
import { eq } from 'drizzle-orm';

let db: Db;

beforeEach(() => {
	db = openDb(':memory:');
});

function setStatus(id: number, status: 'jar' | 'open' | 'done', takenAt?: Date) {
	db.update(task).set({ status, takenAt }).where(eq(task.id, id)).run();
}

describe('createTask', () => {
	it('stores a validated task in the jar', () => {
		const t = createTask(db, { title: '  Water the plants ', minutes: '5' });
		expect(t).toMatchObject({
			title: 'Water the plants',
			minutes: 5,
			status: 'jar',
			skipCount: 0,
			takenAt: null,
			doneAt: null
		});
		expect(t.createdAt).toBeInstanceOf(Date);
	});

	it('rejects tasks over 30 minutes and empty titles', () => {
		expect(() => createTask(db, { title: 'Clean the garage', minutes: 45 })).toThrow(
			TaskValidationError
		);
		try {
			createTask(db, { title: ' ', minutes: 31 });
		} catch (e) {
			expect((e as TaskValidationError).errors).toEqual({
				title: 'title_required',
				minutes: 'too_big'
			});
		}
		expect(countTasks(db).jar).toBe(0);
	});

	it('is backed by a database constraint as well', () => {
		expect(() => db.insert(task).values({ title: 'Sneaky', minutes: 31 }).run()).toThrow(
			/CHECK constraint failed: task_minutes_range/
		);
	});
});

describe('listJar', () => {
	it('lists only jar tasks, sorted by duration then title', () => {
		createTask(db, { title: 'vacuum', minutes: 10 });
		createTask(db, { title: 'Dust', minutes: 10 });
		createTask(db, { title: 'Wash the car mats', minutes: 30 });
		const water = createTask(db, { title: 'Water plants', minutes: 5 });
		const open = createTask(db, { title: 'Descale kettle', minutes: 5 });
		setStatus(open.id, 'open');
		expect(listJar(db).map((t) => t.title)).toEqual([
			'Water plants',
			'Dust',
			'vacuum',
			'Wash the car mats'
		]);
		expect(water.status).toBe('jar');
	});
});

describe('listOpen and countTasks', () => {
	it('lists open tasks newest first and counts by state', () => {
		const a = createTask(db, { title: 'A', minutes: 5 });
		const b = createTask(db, { title: 'B', minutes: 5 });
		const c = createTask(db, { title: 'C', minutes: 5 });
		createTask(db, { title: 'D', minutes: 5 });
		setStatus(a.id, 'open', new Date('2026-09-01'));
		setStatus(b.id, 'open', new Date('2026-09-02'));
		setStatus(c.id, 'done');
		expect(listOpen(db).map((t) => t.title)).toEqual(['B', 'A']);
		expect(countTasks(db)).toEqual({ jar: 1, open: 2 });
	});

	it('counts zero for an empty database', () => {
		expect(countTasks(db)).toEqual({ jar: 0, open: 0 });
	});
});

describe('updateTask', () => {
	it('edits a jar task with the same validation', () => {
		const t = createTask(db, { title: 'Dust', minutes: 10 });
		const updated = updateTask(db, t.id, { title: 'Dust shelves', minutes: 15 });
		expect(updated).toMatchObject({ id: t.id, title: 'Dust shelves', minutes: 15 });
		expect(() => updateTask(db, t.id, { title: 'Dust', minutes: 60 })).toThrow(TaskValidationError);
		expect(getTask(db, t.id)?.minutes).toBe(15);
	});

	it('refuses to edit tasks that are not in the jar, or missing', () => {
		const t = createTask(db, { title: 'Dust', minutes: 10 });
		setStatus(t.id, 'open');
		expect(() => updateTask(db, t.id, { title: 'x', minutes: 5 })).toThrow(TaskNotFoundError);
		expect(() => updateTask(db, 999, { title: 'x', minutes: 5 })).toThrow(TaskNotFoundError);
	});
});

describe('deleteTask', () => {
	it('deletes jar tasks only', () => {
		const a = createTask(db, { title: 'A', minutes: 5 });
		const b = createTask(db, { title: 'B', minutes: 5 });
		setStatus(b.id, 'open');
		deleteTask(db, a.id);
		expect(getTask(db, a.id)).toBeUndefined();
		expect(() => deleteTask(db, b.id)).toThrow(TaskNotFoundError);
		expect(getTask(db, b.id)).toBeDefined();
	});
});

describe('completeTask', () => {
	it('marks an open task done and keeps the record', () => {
		const t = createTask(db, { title: 'A', minutes: 5 });
		setStatus(t.id, 'open');
		const now = new Date('2026-09-30T10:00:00Z');
		expect(completeTask(db, t.id, now)).toMatchObject({ status: 'done', doneAt: now });
		expect(countTasks(db)).toEqual({ jar: 0, open: 0 });
		expect(getTask(db, t.id)?.status).toBe('done');
	});

	it('refuses tasks that are not open', () => {
		const t = createTask(db, { title: 'A', minutes: 5 });
		expect(() => completeTask(db, t.id)).toThrow(TaskNotFoundError);
	});
});
