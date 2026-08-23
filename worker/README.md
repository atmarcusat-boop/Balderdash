# Beau's narration proxy

A tiny Cloudflare Worker that holds the Anthropic API key server-side and
turns real, already-retrieved facts (from Wikipedia/OpenStreetMap/Wikidata)
into persona-voiced narration. It is never asked to invent anything — see
the prompts in `src/index.ts` for the exact truth-preserving constraints.

This is the one piece of infrastructure the app can't run without: GitHub
Pages only serves static files, so the model call needs somewhere else to
live. Free tier (Cloudflare Workers: 100,000 requests/day) covers this
comfortably.

## Deploy (one-time, ~5 minutes)

```bash
cd worker
npm install
npx wrangler login          # opens a browser to authorize your Cloudflare account
npx wrangler secret put ANTHROPIC_API_KEY   # paste your real Anthropic API key when prompted
npx wrangler deploy
```

The last command prints a live URL, something like:

```
https://beau-narration-proxy.<your-subdomain>.workers.dev
```

Take that URL and set it as `CONFIG.narrationEndpoint` near the top of
`index.html` (currently `null`, which keeps the app running keyless —
real Wikipedia/OSM/Wikidata extracts read as-is, no model call). Once set,
every narration request routes through this worker instead.

## Configuration

Edit `wrangler.toml`:

- `ALLOWED_ORIGIN` — must match the origin the app is actually served
  from (comma-separated if more than one). The worker rejects
  cross-origin requests from anywhere else via CORS.
- `MODEL_ID` — defaults to `claude-opus-5`. This runs once per card per
  lookup (up to ~10 cards), so cost is small per request, but latency and
  per-request cost both scale with model choice — `claude-haiku-4-5` is a
  reasonable trade for speed/cost on this short, high-frequency task if
  Opus 5's quality isn't needed here.

## Hardening before real traffic

This endpoint spends real money per request and is publicly reachable
(GitHub Pages is public). Before pointing real users at it:

- Add a rate-limiting rule on the Worker's route in the Cloudflare
  dashboard (Security → WAF → Rate limiting rules) — free tier includes
  basic rules. Nothing in the code enforces a rate limit on its own.
- Consider capping spend with a budget alert in your Anthropic Console.

## Local testing

```bash
npm run dev       # runs the worker locally with wrangler
npm run typecheck # tsc --noEmit
```

`npm run dev` needs `ANTHROPIC_API_KEY` available locally — wrangler reads
`.dev.vars` (create it, gitignored) with `ANTHROPIC_API_KEY=sk-ant-...`
for local runs; the deployed secret is separate and set via
`wrangler secret put`.
