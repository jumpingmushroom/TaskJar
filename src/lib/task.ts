/** Shared task domain constants, used by the UI, the server and the draw logic. */

export const MIN_TASK_MINUTES = 1;
export const MAX_TASK_MINUTES = 30;

export const TASK_STATUSES = ['jar', 'open', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
