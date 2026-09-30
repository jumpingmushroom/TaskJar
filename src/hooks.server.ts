import type { Handle, ServerInit } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { parseTheme, THEME_COOKIE } from '$lib/theme';

/** Open the database and run migrations at startup, so a bad schema fails fast. */
export const init: ServerInit = () => {
	getDb();
};

export const handle: Handle = ({ event, resolve }) => {
	// No auth in the MVP: everyone on the network shares the jar. Profiles and
	// auth will resolve the actor here.
	event.locals.actor = null;

	// A theme picked on this device is applied server-side, so there is no flash.
	const theme = parseTheme(event.cookies.get(THEME_COOKIE));
	event.locals.theme = theme;
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%taskjar.theme%', theme ? `data-theme="${theme}"` : '')
	});
};
