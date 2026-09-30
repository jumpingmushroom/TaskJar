import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db';

/** Liveness check for Docker: the server responds and the database answers. */
export function GET() {
	getDb().run(sql`select 1`);
	return json({ ok: true });
}
