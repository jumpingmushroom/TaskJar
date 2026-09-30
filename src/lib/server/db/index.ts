import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as schema from './schema';

export type Db = BetterSQLite3Database<typeof schema>;

/**
 * Opens a SQLite database and brings its schema up to date. Pass ':memory:'
 * for tests.
 */
export function openDb(
	filename: string,
	migrationsFolder = process.env.MIGRATIONS_DIR ?? resolve('drizzle')
): Db {
	if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true });
	const client = new Database(filename);
	client.pragma('journal_mode = WAL');
	client.pragma('foreign_keys = ON');
	client.pragma('busy_timeout = 5000');
	const db = drizzle(client, { schema });
	migrate(db, { migrationsFolder });
	return db;
}

let instance: Db | undefined;

/** The app's database, opened lazily so builds never touch the data file. */
export function getDb(): Db {
	instance ??= openDb(process.env.DATABASE_URL ?? 'data/taskjar.db');
	return instance;
}
