# Itay's World of Games — Platform Design

## Purpose
A single static web page that lists games Itay creates as standalone
HTML files. He should be able to add a new game by dropping a `.html`
file into a folder and pushing — the platform list updates itself with
no manual editing of any list/config file.

## Constraints
- Hosting: GitHub Pages (static hosting only — no server-side code at
  runtime). The repo will eventually be transferred to Itay's own
  GitHub account and configured for Pages there; this design does not
  touch any GitHub account/Pages settings itself, only prepares the
  repo content.
- Each game is a fully self-contained `.html` file (its own CSS/JS
  inline or same-folder assets) — the platform does not know anything
  about a game's internals beyond its `<title>`.
- Audience is a kid — the page should be simple, playful, and require
  the minimum possible steps to add a game.

## Success criteria
- Itay adds a `.html` game file to `games/` (via `git push` or
  GitHub's web "Add file" UI) with a `<title>` in it, and after the
  push the platform page lists it — no other manual step.
- Opening a game is a normal full-page navigation (not an iframe), so
  games that use fullscreen APIs, keyboard shortcuts, or assume the
  full window behave normally.
- A missing `<title>` never breaks the build; it just falls back to a
  filename-derived title.

## Repo layout
```
index.html                    # platform page: colorful grid of game cards
styles.css                    # playful, colorful styling
app.js                        # fetches games/games.json, renders cards, handles empty/error state
games/
  games.json                  # AUTO-GENERATED manifest — never hand-edited
  example-game.html           # starter template game Itay can copy
scripts/
  build-manifest.js           # Node script: scans games/*.html, extracts <title>, writes games.json
.github/workflows/
  build-manifest.yml          # on push touching games/**, runs the script, commits games.json back
README.md                     # short instructions for adding a game
```

## Data flow
1. Itay adds `games/mygame.html` (containing `<title>My Game</title>`
   in its `<head>`) and pushes to `main` (or uses GitHub's web UI to
   add the file directly — no local git required).
2. `.github/workflows/build-manifest.yml` triggers on any push to
   `main` that touches `games/**`. It runs
   `node scripts/build-manifest.js`, which:
   - Scans `games/*.html`, skipping `games.json` itself.
   - Reads each file's `<title>...</title>`; if absent, derives a
     title from the filename (kebab/snake-case → Title Case, e.g.
     `space_invaders.html` → "Space Invaders").
   - Writes `games/games.json` as a sorted (by title) array of
     `{ "title": "...", "file": "mygame.html" }` objects.
   - If `games.json` changed, the workflow commits it back to `main`
     using a bot commit (`github-actions[bot]`).
3. GitHub Pages redeploys from `main`.
4. `index.html`/`app.js` fetches `games/games.json` at load time and
   renders one card per entry (title only — no thumbnails in v1).
5. Clicking a card is a normal `<a href="games/mygame.html">` link —
   full-page navigation. The browser's Back button returns to the
   platform page.

## Error handling / edge cases
- `games.json` missing, empty array, or fetch failure → render a
  friendly empty state ("No games yet — add one to the games
  folder!") instead of a broken/blank page.
- Titles are rendered via `textContent` (not `innerHTML`) so any
  stray `<`, `&`, etc. in a title can't break the page or inject
  markup.
- The build script ignores non-`.html` files and `games.json` itself,
  so unrelated files dropped in `games/` don't break the build.
- The build script never throws on a missing `<title>` — it always
  falls back to a filename-derived title, so a forgotten `<title>`
  never blocks the game from appearing.

## Out of scope (v1)
- Thumbnails/screenshots per game.
- Any in-page "back to home" link injected into game files (relies on
  browser Back).
- Any account/auth, comments, scores, or persistence across games.
- Any GitHub account or Pages configuration (done later, directly on
  Itay's account).

## Testing plan
- Unit-style manual tests of `scripts/build-manifest.js`: a game with
  a normal `<title>`, a game with no `<title>` (filename fallback), a
  title containing special characters (`<`, `&`, apostrophes).
- Local preview of `index.html` via a throwaway static file server
  (GitHub Pages semantics — `fetch` of a local JSON file needs a
  server, not `file://`).
- Validate `.github/workflows/build-manifest.yml` YAML syntax; the
  workflow itself is exercised for real once the repo is live on
  GitHub Pages (out of scope for this local build to fully verify).
