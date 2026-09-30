import type { Handle, ServerInit } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** Open the database and run migrations at startup, so a bad schema fails fast. */
export const init: ServerInit = () => {
	getDb();
};

export const handle: Handle = ({ event, resolve }) => {
	// No auth in the MVP: everyone on the network shares the jar. Profiles and
	// auth will resolve the actor here.
	event.locals.actor = null;
	return resolve(event);
};
