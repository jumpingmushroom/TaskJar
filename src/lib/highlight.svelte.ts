import { replaceState } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { onMount } from 'svelte';

/**
 * Finds a task that was just added or taken, so the list can animate it in
 * once. It arrives as page state (client-side hops) or as `?highlight=<id>`
 * (server redirects, plain links); the query is then dropped from the address
 * bar so a reload doesn't replay the animation.
 */
export function useHighlight(route: '/jar' | '/open') {
	const fromQuery = Number(page.url.searchParams.get('highlight')) || null;
	const id = page.state.highlight ?? fromQuery;
	onMount(() => {
		if (fromQuery !== null) replaceState(resolve(route), {});
	});
	return id;
}
