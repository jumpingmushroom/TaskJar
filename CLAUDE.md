# TaskJar

Household "task jar" web app: add small tasks (1–30 min), pick how much time you have (5, 15 or 30 min), get one weighted-random task that fits. Self-hosted, no auth in the MVP.

## Commands

- `npm run dev`: dev server
- `npm test`: unit tests (Vitest, run once)
- `npm run check`: svelte-check / TypeScript
- `npm run lint` / `npm run format`: Prettier + ESLint
- `npm run build`: production build (`adapter-node`, output in `build/`)

Run `npm run check`, `npm run lint` and `npm test` before opening a PR.

## Git workflow

- Never commit directly to `main`. Every change goes on a branch (`feat/…`, `fix/…`, `chore/…`, `docs/…`, `refactor/…`, `test/…`) and lands through a GitHub PR (`gh pr create`).
- PRs are **squash-merged** (the repo only allows squash merges). The PR title becomes the commit on `main`, so it must be a conventional commit.
- Keep PRs small and reviewable: one step of the plan per PR.
- **Conventional Commits** for commit messages and PR titles: `type(scope): summary`, imperative, lower case, no trailing period. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `build`, `ci`.
- **No AI attribution** anywhere in commits or PRs: no `Co-Authored-By` trailers for AI tools, no "Generated with …" lines, no emoji signatures.

## Design handoff (local only)

The spec and design live in `./taskjar-handoff/` (`SPEC.md`, `DESIGN.md`, `design/*.dc.html`). The folder is git-ignored, so search tools may skip it: read the files by path. **Never copy these files into the repo and never commit anything from that folder.** The `.dc.html` files need a canvas runtime; read them as markup and style reference only.

## Product rules that must not drift

- A task's duration is a whole number of minutes, **1–30**. Enforce it in the UI, in the server action/repository validation, and with a DB CHECK constraint.
- Task states: `jar` → `open` (Take it) → `done` (check). Skip leaves a task in the jar. Done tasks are kept, not deleted.
- Draw logic lives in a pure, unit-tested module (no DB, no DOM, RNG injected): candidates are `jar` tasks with `minutes ≤ N`, minus tasks skipped in the current draw session (skips accumulate); pick is weighted with `weight = 0.35 + minutes / N`.
- The server performs the pick and records a `draw` row (`pending` → `taken` | `skipped` | `abandoned`); the client only animates.
- Out-of-scope features (SPEC §7: forcing, recurring, people, seasonal/sequences, wall panel) stay out, but keep the model open for them: keep `skip_count`, `taken_at`, `done_at` and the `draw` log accurate.
- No auth yet: all data access goes through `src/lib/server/` repository functions, so profiles and auth can be added in one place later.

## UI conventions

- Use the colour tokens (CSS custom properties) from the global stylesheet; never hard-code palette hex values in components. Dark mode follows `prefers-color-scheme`.
- Fonts are self-hosted: Bricolage Grotesque (display) and Figtree (body).
- 3px ink outlines, hard offset shadows with no blur, buttons that press down (`translateY(4px)`, 90 ms).
- Every animation must degrade to a simple fade under `prefers-reduced-motion`.
- Real `<button>`, `<input>` and `<label>` elements; `aria-label` on icon-only buttons; visible focus ring; touch targets ≥ 44px; no emoji in the UI.
- UI copy is English and comes from the spec verbatim.
