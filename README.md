# MindDev25 Reversi

A local-first Reversi game, the first app in MindDev25's collection.

**Play:** https://minddev25.github.io/minddev25_apps/

- English, Japanese, Simplified Chinese, and Korean
- Ten local AI levels or pass-and-play for two people
- Automatic forced passes and standard game-ending rules
- Browser-local profiles, win statistics, automatic resume, and up to 200 completed games
- Move-by-move replay, hints, undo, and JSON backup / restore
- Keyboard-operable board, responsive layout, reduced-motion support
- No external API, analytics, remote fonts, or server-side game state

## Development

Node.js 22.20+ and npm.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Architecture

React + TypeScript + Vite. `src/game/engine.ts` owns immutable rules and AI; `ai.worker.ts` isolates search from rendering. Versioned storage is in `storage.ts`, dictionaries in `i18n.ts`, and semantic board/dialog primitives in `components/`.

AI level 1 picks a random legal move; level 2 greedily maximizes immediate flips. Levels 3–10 use iterative-deepening negamax, alpha-beta pruning, move ordering and a bounded transposition table. Evaluation combines square weights, mobility, frontier exposure and game-phase disc balance. Search budgets are 40, 80, 140, 250, 450, 800, 1300 and 2000 ms. Levels 8–10 attempt exact small endgames when empties are at most level + 3; the time budget still applies. Actual completed depth depends on device and position. Difficulty is an approximate progression, not a certified rating or a promise of perfect play. No third-party engine code or model weights are included.

Hints and undo mark a match as practice, excluded from win statistics. Completed matches cannot be undone. Profile names are captured in each match so old replays retain their original participants. Removing a profile does not delete its match history.

Data lives under `minddev25-reversi:v1` in localStorage. Browser data is not cloud-synced, may be cleared by the browser, and is shared by pages on the same origin. Export backups when needed. Backup import replays every move to validate rules and rejects oversized or incompatible data. The site requires an initial network load; offline reload/install support is not currently included.

## Deployment

Repository Settings → Pages → Source: **GitHub Actions**. The included workflow checks lint, rules/AI tests, and the production build before deploying `dist/` on main. Pull requests run checks without publishing. Vite base is `/minddev25_apps/`; change it if the repository path changes. Revert a commit and push to main to roll back.

## Visual direction

Warm ivory, forest-green board, coral accents, editorial serif headings. The board and ceramic discs are code-native for crisp resizing and accessible interaction. Branding is descriptive: MindDev25 Reversi; no affiliation with any other game publisher is implied.
