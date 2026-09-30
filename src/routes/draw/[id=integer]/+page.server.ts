import { error, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import {
	abandonDraw,
	DrawStateError,
	getDrawView,
	shuffleSample,
	skipDraw,
	startDraw,
	takeDraw
} from '$lib/server/draws';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const db = getDb();
	const view = getDrawView(db, Number(params.id));
	if (!view) error(404, 'That draw no longer exists.');

	const { outcome } = view.draw;
	// Old draws (via the back button or a stale tab) aren't replayable.
	if (outcome === 'taken') redirect(303, '/open');
	if (outcome !== 'pending' && outcome !== 'empty') redirect(303, '/');

	return {
		drawId: view.draw.id,
		minutes: view.minutes,
		task: view.task && { id: view.task.id, title: view.task.title, minutes: view.task.minutes },
		afterSkip: view.afterSkip,
		sample: view.task ? shuffleSample(db) : [],
		// Set when the previous pick was taken on another device first.
		gone: url.searchParams.has('gone')
	};
};

export const actions: Actions = {
	skip: ({ params }) => {
		try {
			const next = skipDraw(getDb(), Number(params.id));
			redirect(303, `/draw/${next.drawId}`);
		} catch (e) {
			if (e instanceof DrawStateError) redirect(303, '/');
			throw e;
		}
	},
	take: ({ params }) => {
		const db = getDb();
		const id = Number(params.id);
		let result;
		try {
			result = takeDraw(db, id);
		} catch (e) {
			if (e instanceof DrawStateError) redirect(303, '/');
			throw e;
		}
		if (result.ok) redirect(303, `/go/${result.task.id}`);
		// Someone else got there first: pull again for the same time.
		const minutes = getDrawView(db, id)!.minutes;
		redirect(303, `/draw/${startDraw(db, minutes).drawId}?gone`);
	},
	back: ({ params }) => {
		abandonDraw(getDb(), Number(params.id));
		redirect(303, '/');
	}
};
