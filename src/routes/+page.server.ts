import { error, redirect } from '@sveltejs/kit';
import { isDrawMinutes } from '$lib/draw';
import { getDb } from '$lib/server/db';
import { startDraw } from '$lib/server/draws';
import type { Actions } from './$types';

export const actions: Actions = {
	draw: async ({ request }) => {
		const minutes = Number((await request.formData()).get('minutes'));
		if (!isDrawMinutes(minutes)) error(400, 'Pick 5, 15 or 30 minutes.');
		const result = startDraw(getDb(), minutes);
		redirect(303, `/draw/${result.drawId}`);
	}
};
