import { replaceState } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { onMount } from 'svelte';

/**
 * Reads `?highlight=<id>` (a task that was just added or taken) so the list
 * can animate it in once, then drops the query from the address bar so a
 * reload doesn't replay the animation.
 */
export function useHighlight(route: '/jar' | '/open') {
	const id = Number(page.url.searchParams.get('highlight')) || null;
	onMount(() => {
		if (id !== null) replaceState(resolve(route), page.state);
	});
	return id;
}
