// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Who is acting. Always null until profiles and auth exist. */
			actor: null;
			/** Theme picked on this device, or null to follow the system. */
			theme: import('$lib/theme').Theme | null;
		}
		// interface PageData {}
		interface PageState {
			/** A task to animate into a list after a client-side hop (Go! → Open). */
			highlight?: number;
		}
		// interface Platform {}
	}
}

export {};
