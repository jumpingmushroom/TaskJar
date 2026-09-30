import { redirect } from '@sveltejs/kit';
import { parseTheme, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from '$lib/theme';
import type { RequestHandler } from './$types';

/**
 * No-JavaScript fallback for the theme toggle: stores the requested theme (or
 * clears it with "system") and goes back. With JavaScript the toggle sets the
 * cookie itself and never posts here.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const data = await request.formData();
	const theme = parseTheme(data.get('theme'));
	if (theme) {
		cookies.set(THEME_COOKIE, theme, {
			path: '/',
			maxAge: THEME_COOKIE_MAX_AGE,
			httpOnly: false,
			sameSite: 'lax',
			secure: false
		});
	} else {
		// Must match how the cookie was set: plain http on the LAN can't use Secure.
		cookies.delete(THEME_COOKIE, { path: '/', httpOnly: false, secure: false });
	}
	redirect(303, '/');
};
