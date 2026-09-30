import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getTask } from '$lib/server/tasks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const task = getTask(getDb(), Number(params.id));
	// Only a task that is currently open can be celebrated.
	if (!task || task.status !== 'open') redirect(303, '/open');
	return { task: { id: task.id, title: task.title, minutes: task.minutes } };
};
