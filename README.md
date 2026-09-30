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

## Deployment

Every merge to `main` that passes CI publishes `ghcr.io/jumpingmushroom/taskjar:latest` (plus a `sha-<commit>` tag). The image is linux/amd64 and keeps its SQLite database in `/data`; migrations run automatically on start.

### Unraid

The template and icon ship inside the image. Install them from the Unraid terminal:

```sh
docker run --rm --entrypoint cat ghcr.io/jumpingmushroom/taskjar:latest /app/unraid/taskjar.xml \
  > /boot/config/plugins/dockerMan/templates-user/my-TaskJar.xml
mkdir -p /boot/config/plugins/dockerMan/images
docker run --rm --entrypoint cat ghcr.io/jumpingmushroom/taskjar:latest /app/unraid/icon.png \
  > /boot/config/plugins/dockerMan/images/TaskJar-icon.png
```

Then go to **Docker → Add Container**, pick **TaskJar** from the template list, and set **App URL** to the exact address you'll open, such as `http://192.168.1.20:3000`, matching the WebUI port. Data goes to `/mnt/user/appdata/taskjar`, and the app runs as `nobody:users` (PUID 99 / PGID 100). Unraid's normal "update available" check picks up new builds of `:latest`.

### Docker Compose

```sh
cp .env.example .env   # then set ORIGIN
docker compose up -d --build
```

### Settings

| Variable        | Default            | Notes                                                                                                                 |
| --------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `ORIGIN`        | (required)         | The exact URL people open the app on. Without it every form submit fails with 403.                                    |
| `PORT`          | `3000`             | Port the app listens on inside the container (Compose also uses it as the host port).                                 |
| `PUID` / `PGID` | `1000` / `1000`    | User and group the app runs as; the container fixes ownership of `/data` at start. The Unraid template sets 99 / 100. |
| `DATABASE_URL`  | `/data/taskjar.db` | SQLite file path inside the container.                                                                                |

If you open the app on more than one hostname, `ORIGIN` only allows one of them. In that case, replace it with `PROTOCOL_HEADER=x-forwarded-proto` and `HOST_HEADER=x-forwarded-host` behind a proxy that sets those headers.

The container reports health at `/healthz`. Back up by copying `taskjar.db` from the data folder while the app is stopped, or use `sqlite3 .backup`.
