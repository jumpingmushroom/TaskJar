/** Client-only app state. */

let hydrated = false;

/** Called once by the root layout after the first page has hydrated. */
export function markHydrated() {
	hydrated = true;
}

/**
 * True after the initial page load. Screens use it to play entrance
 * animations only after an in-app navigation, never on a hard reload
 * (where the server already rendered the final state).
 */
export function isHydrated() {
	return hydrated;
}
