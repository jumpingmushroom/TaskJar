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

## Deployment (Docker Compose / Dokploy)

The app is a single container with a SQLite database on a named volume (`taskjar-data`, mounted at `/data`). Migrations run automatically on start.

```sh
cp .env.example .env   # then set ORIGIN
docker compose up -d --build
```

| Variable       | Default            | Notes                                                                                                              |
| -------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `ORIGIN`       | (required)         | The exact URL people open the app on, e.g. `http://taskjar.home.lan`. Without it every form submit fails with 403. |
| `PORT`         | `3000`             | Host port Compose publishes.                                                                                       |
| `DATABASE_URL` | `/data/taskjar.db` | SQLite file path inside the container.                                                                             |

On **Dokploy**: create a Compose app from this repo, set `ORIGIN` under Environment to the domain you assign, and attach the domain to the `taskjar` service on port 3000. If you route through Dokploy's Traefik, you can remove the `ports` mapping.

If you open the app on more than one hostname (say, an IP and a domain), `ORIGIN` only allows one. In that case, replace it with `PROTOCOL_HEADER=x-forwarded-proto` and `HOST_HEADER=x-forwarded-host` behind a proxy that sets those headers.

The container reports health at `/healthz`. Back up by copying `taskjar.db` from the volume, with the app stopped or via `sqlite3 .backup`.
