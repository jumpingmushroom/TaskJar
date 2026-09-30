# TaskJar

A household "task jar" for small chores. Put short tasks (30 minutes max) in the jar, say how much time you have (5, 15 or 30 minutes), and pull one random task that fits.

Self-hosted on the home network. No accounts in the MVP: anyone on the network shares the same jar.

## Stack

SvelteKit (Svelte 5, TypeScript, `adapter-node`), Drizzle ORM with SQLite, Vitest, Docker Compose.

## Development

Requires Node 22 or newer.

```sh
npm install
npm run dev        # dev server on http://localhost:5173
npm test           # unit tests
npm run check      # type check
npm run lint       # prettier + eslint
npm run build      # production build into ./build
```
