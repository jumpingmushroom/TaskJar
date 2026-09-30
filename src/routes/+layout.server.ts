import { getDb } from '$lib/server/db';
import { countTasks } from '$lib/server/tasks';
import type { LayoutServerLoad } from './$types';

/** Live counts for the tab badge and home pills, and this device's theme choice. */
export const load: LayoutServerLoad = ({ locals }) => ({
	counts: countTasks(getDb()),
	theme: locals.theme
});
