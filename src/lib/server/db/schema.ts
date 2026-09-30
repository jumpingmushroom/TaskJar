import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { DRAW_OPTIONS } from '../../draw';
import { MAX_TASK_MINUTES, MAX_TITLE_LENGTH, MIN_TASK_MINUTES, TASK_STATUSES } from '../../task';

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date());

export const task = sqliteTable(
	'task',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		title: text('title').notNull(),
		minutes: integer('minutes').notNull(),
		status: text('status', { enum: TASK_STATUSES }).notNull().default('jar'),
		createdAt: createdAt(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date()),
		takenAt: integer('taken_at', { mode: 'timestamp_ms' }),
		doneAt: integer('done_at', { mode: 'timestamp_ms' }),
		// Shared skip counter; the basis for "forcing" later (SPEC §7).
		skipCount: integer('skip_count').notNull().default(0)
	},
	(t) => [
		// The 30-minute rule, enforced by the database as a last line of defence.
		check(
			'task_minutes_range',
			sql`${t.minutes} BETWEEN ${sql.raw(String(MIN_TASK_MINUTES))} AND ${sql.raw(String(MAX_TASK_MINUTES))}`
		),
		check(
			'task_title_length',
			sql`length(trim(${t.title})) BETWEEN 1 AND ${sql.raw(String(MAX_TITLE_LENGTH))}`
		),
		check(
			'task_status_values',
			sql`${t.status} IN (${sql.raw(TASK_STATUSES.map((s) => `'${s}'`).join(', '))})`
		),
		index('task_status_idx').on(t.status)
	]
);

export const DRAW_OUTCOMES = ['pending', 'taken', 'skipped', 'abandoned', 'empty'] as const;
export type DrawOutcome = (typeof DRAW_OUTCOMES)[number];

/**
 * One pull from the jar. Pressing a time button starts a session; each skip
 * resolves the current draw as `skipped` and adds a new draw to the session.
 * `empty` records a pull where nothing fitted (task_id is null).
 */
export const draw = sqliteTable(
	'draw',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		sessionId: text('session_id').notNull(),
		minutesSelected: integer('minutes_selected').notNull(),
		taskId: integer('task_id').references(() => task.id, { onDelete: 'set null' }),
		outcome: text('outcome', { enum: DRAW_OUTCOMES }).notNull().default('pending'),
		createdAt: createdAt(),
		resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' })
	},
	(t) => [
		check(
			'draw_minutes_values',
			sql`${t.minutesSelected} IN (${sql.raw(DRAW_OPTIONS.join(', '))})`
		),
		check(
			'draw_outcome_values',
			sql`${t.outcome} IN (${sql.raw(DRAW_OUTCOMES.map((s) => `'${s}'`).join(', '))})`
		),
		index('draw_session_idx').on(t.sessionId),
		index('draw_outcome_idx').on(t.outcome)
	]
);

export type Task = typeof task.$inferSelect;
export type Draw = typeof draw.$inferSelect;
