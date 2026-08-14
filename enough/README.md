# Enough

A low-pressure daily check-in across 12 wellbeing items. Swipe through them
once a day, then look back at a calm 3-month grid to see where the gaps are.
No streaks, no goals, no scores — just noticing.

Everything runs in the browser. There's no backend and no accounts; all data
lives in your browser's local storage.

## Running it

```bash
npm install
npm run dev -- --host
```

The `--host` flag exposes the dev server on your local network so you can
open it on a phone. Vite will print a `Network:` URL (something like
`http://192.168.x.x:5173/`) — open that on a phone connected to the same
Wi-Fi to try it on a real touchscreen.

## Editing the items

The 12 items live in `src/data/items.js` — each one is a plain object with
an `id`, `section`, `name`, front-of-card `front` question, and back-of-card
`back` description. Add, remove, or reorder entries there; nothing else
needs to change. Each item also has an `image` field, left `null` for now,
for dropping in a card background image later.

## Dev tools

Open the `⋯` tab in the bottom bar for two dev-only actions: filling in
three months of random test data (so the Progress grid has something to
show immediately) and resetting all stored data.
