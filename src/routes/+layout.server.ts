import { getDb } from '$lib/server/db';
import { countTasks } from '$lib/server/tasks';
import type { LayoutServerLoad } from './$types';

/** Live counts for the tab badge and home pills. */
export const load: LayoutServerLoad = () => ({ counts: countTasks(getDb()) });
