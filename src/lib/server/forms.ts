import { fail } from '@sveltejs/kit';
import { validateTask } from '../task';

/** Reads and validates the add/edit form; returns a 400 `fail` on invalid input. */
export async function readTaskForm(request: Request) {
	const data = await request.formData();
	const raw = { title: data.get('title'), minutes: data.get('minutes') };
	const result = validateTask(raw);
	if (!result.ok) {
		return {
			ok: false as const,
			failure: fail(400, {
				title: typeof raw.title === 'string' ? raw.title : '',
				minutes: typeof raw.minutes === 'string' ? raw.minutes : '',
				errors: result.errors
			})
		};
	}
	return { ok: true as const, value: result.value };
}
