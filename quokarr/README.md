# Quokarr

Ball-by-ball cricket scoring for a single limited-overs match. Mobile-first,
one-handed scoring, fully offline — no backend, no accounts. Match state is
persisted to `localStorage` after every ball, so a refresh or a dropped
signal at the ground never loses the game.

## Running it

```sh
npm install
npm run dev
```

```sh
npm run build    # type-checks and builds to dist/
npm run preview  # serve the production build locally
```

## How it's built

- **React + Vite + TypeScript**, styled with Tailwind CSS v4 and
  [lucide-react](https://lucide.dev) icons.
- The ball-by-ball log (`src/engine/types.ts`) is the single source of
  truth. Every derived number — totals, overs, strike rotation, extras,
  bowling figures, fall of wickets — is computed by replaying that log
  (`src/engine/matchEngine.ts`). Undo just drops the last ball and replays,
  so nothing can drift out of sync.
- `src/hooks/useMatchStore.tsx` persists the match to `localStorage` on
  every change and exposes the actions (`newMatch`, `startInnings`,
  `recordBall`, `undo`, `discardMatch`).
- Screens live under `src/components/`: `setup/` (match + innings setup),
  `scoring/` (the live control panel), `live/` (read-only glanceable view),
  `summary/` (result + full scorecard).

## Deployment

Pushes to this branch that touch `quokarr/**` are built and published to
GitHub Pages by `.github/workflows/deploy-quokarr.yml`.
