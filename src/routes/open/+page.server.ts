import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { completeTask, listOpen, TaskNotFoundError } from '$lib/server/tasks';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	tasks: listOpen(getDb()).map((t) => ({
		id: t.id,
		title: t.title,
		minutes: t.minutes,
		takenAt: t.takenAt
	}))
});

export const actions: Actions = {
	done: async ({ request }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Unknown task.' });
		try {
			completeTask(getDb(), id);
		} catch (e) {
			// Already done on another device: the list refresh takes care of it.
			if (!(e instanceof TaskNotFoundError)) throw e;
		}
		return { done: id };
	}
};
