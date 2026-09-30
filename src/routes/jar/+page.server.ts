import { getDb } from '$lib/server/db';
import { listJar } from '$lib/server/tasks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ tasks: listJar(getDb()) });
