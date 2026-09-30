/** Shared task domain rules, used by the UI, the server and the draw logic. */

export const MIN_TASK_MINUTES = 1;
export const MAX_TASK_MINUTES = 30;
export const MAX_TITLE_LENGTH = 120;

export const TASK_STATUSES = ['jar', 'open', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface TaskInput {
	title: string;
	minutes: number;
}

export type TaskErrorCode = 'title_required' | 'title_too_long' | 'minutes_invalid' | 'too_big';
export type TaskErrors = Partial<Record<keyof TaskInput, TaskErrorCode>>;

export const TASK_ERROR_MESSAGES: Record<TaskErrorCode, string> = {
	title_required: 'Give it a name first.',
	title_too_long: `Keep it short: ${MAX_TITLE_LENGTH} characters max.`,
	minutes_invalid: `Pick a time between ${MIN_TASK_MINUTES} and ${MAX_TASK_MINUTES} minutes.`,
	too_big: 'Too big! Split it into smaller tasks.'
};

export type TaskValidation = { ok: true; value: TaskInput } | { ok: false; errors: TaskErrors };

/** True when a duration breaks the 30-minute rule. */
export function isTooBig(minutes: number): boolean {
	return minutes > MAX_TASK_MINUTES;
}

function toMinutes(raw: unknown): number {
	if (typeof raw === 'number') return raw;
	if (typeof raw === 'string' && /^\s*-?\d+\s*$/.test(raw)) return Number(raw);
	return NaN;
}

/**
 * Validates untrusted task input (form data or JSON). The same function runs
 * in the browser and on the server, so both enforce identical rules.
 */
export function validateTask(raw: { title?: unknown; minutes?: unknown }): TaskValidation {
	const errors: TaskErrors = {};

	const title = typeof raw.title === 'string' ? raw.title.trim() : '';
	if (!title) errors.title = 'title_required';
	else if (title.length > MAX_TITLE_LENGTH) errors.title = 'title_too_long';

	const minutes = toMinutes(raw.minutes);
	if (!Number.isInteger(minutes) || minutes < MIN_TASK_MINUTES) errors.minutes = 'minutes_invalid';
	else if (isTooBig(minutes)) errors.minutes = 'too_big';

	if (errors.title || errors.minutes) return { ok: false, errors };
	return { ok: true, value: { title, minutes } };
}
