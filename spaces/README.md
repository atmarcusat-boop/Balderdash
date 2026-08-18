# Spaces

A word-guessing game against the clock. Each card shows a word with some
letters blanked out, a definition, and an example sentence. Fill in the
gaps, swipe right (or tap the check button) to submit, swipe left to skip.
Get it wrong and the card just shakes — try again. Get 10 words right
before the 5-minute timer runs out; every correct word buys 30 more
seconds.

Same card-based interaction and visual system as [Enough](../enough), a
different game built on top of it.

## Running it

```bash
npm install
npm run dev -- --host
```

## Word source

By default Spaces plays from a small built-in word list (`src/data/words.js`)
so it works with zero setup. Optionally, add an Anthropic API key in
Settings and it'll generate a fresh word from the LLM each round instead —
the key is a simple "bring your own key" pattern: it's stored in this
browser's local storage and sent directly to Anthropic's API on each
request (`anthropic-dangerous-direct-browser-access`). There's no backend
here to proxy it through, so treat the key as visible to anyone with
access to this browser/device.

If the LLM call ever fails (bad key, offline, rate limited), Spaces falls
back to the built-in word list for that round automatically.

## Editing the word bank

`src/data/words.js` is a flat list of `{ word, definition, example }`
objects — the `example` sentence should just contain the real word
normally; it gets blanked out at render time. Add, remove, or edit entries
freely.

## Blanking logic

`src/lib/blanks.js` decides which letters are shown vs. hidden: the first
letter is always shown, the last letter is always hidden (for words over
3 letters), and the rest alternate with a randomized starting parity so
the same word doesn't look identical every time it comes up.
