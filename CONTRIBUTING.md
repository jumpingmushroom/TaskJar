# Contributing

Thanks for your interest in TaskJar! Bug reports, ideas and pull requests are welcome.

- **Bugs and ideas:** open an issue with the matching template. For larger changes, please open an issue first so we can agree on the approach.
- **Pull requests:** branch from `main`, keep PRs small and focused, and use a [Conventional Commits](https://www.conventionalcommits.org/) title (`feat: …`, `fix: …`, `docs: …`). PRs are squash-merged, so the title becomes the commit.
- **Before you push:** `npm run check`, `npm run lint` and `npm test` should pass. CI also runs the Playwright e2e suite and a container smoke test.
- **Scope:** TaskJar stays small on purpose. Every task is 30 minutes or less, and the draw logic in `src/lib/draw.ts` stays pure and unit-tested. See the roadmap in the README for what's planned.

Development setup is in the README.
