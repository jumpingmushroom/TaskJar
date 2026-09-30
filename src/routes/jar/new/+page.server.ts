import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { readTaskForm } from '$lib/server/forms';
import { createTask } from '$lib/server/tasks';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await readTaskForm(request);
		if (!form.ok) return form.failure;
		const task = createTask(getDb(), form.value);
		redirect(303, `/jar?highlight=${task.id}`);
	}
};
