import { error, fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { readTaskForm } from '$lib/server/forms';
import { deleteTask, getTask, TaskNotFoundError, updateTask } from '$lib/server/tasks';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const task = getTask(getDb(), Number(params.id));
	// Only tasks in the jar can be edited in the MVP.
	if (!task || task.status !== 'jar') error(404, 'That task is no longer in the jar.');
	return { task };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const form = await readTaskForm(request);
		if (!form.ok) return form.failure;
		try {
			updateTask(getDb(), Number(params.id), form.value);
		} catch (e) {
			if (e instanceof TaskNotFoundError) error(404, 'That task is no longer in the jar.');
			throw e;
		}
		redirect(303, `/jar?highlight=${params.id}`);
	},
	delete: async ({ request, params }) => {
		const data = await request.formData();
		// Without JavaScript the first press asks for confirmation.
		if (data.get('confirm') !== 'yes') return fail(409, { confirmDelete: true });
		try {
			deleteTask(getDb(), Number(params.id));
		} catch (e) {
			if (!(e instanceof TaskNotFoundError)) throw e;
		}
		redirect(303, '/jar');
	}
};
