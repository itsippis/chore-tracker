# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (app is served under `/chore-tracker/`)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — serve the built `dist/`

There is no test suite.

## Environment

Firebase config comes from `VITE_FIREBASE_*` env vars (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, optional `MEASUREMENT_ID`), read in `src/firebase.js`. Locally they go in a gitignored `.env`; in CI they come from GitHub repo secrets.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with Node 22 and deploys `dist/` to GitHub Pages (https://itsippis.github.io/chore-tracker). The `npm run deploy` script (gh-pages) is a legacy manual alternative. Because the site lives at a subpath, `vite.config.js` sets `base: "/chore-tracker/"` and the PWA manifest icon paths are hard-coded with that prefix — keep them in sync if the base changes. The app is an installable PWA (`vite-plugin-pwa`, `registerType: "autoUpdate"`).

## Code Style

- Always use named exports; never use default exports.

## Architecture

React 19 + Vite, plain JSX (no TypeScript, no router, no CSS framework). Nearly the entire app is in `src/App.jsx`: constants, helpers, all components (views, modals, setup screen), and the root `ChoreTracker` component that owns all state.

**Shared data model.** All household state lives in a single Firestore document, `household/shared`, stored as one JSON string in its `data` field. Parsed shape:

```
{ chores: [{id, name, icon, color}], nextId, users: {[userId]: {name, color}},
  completed: {[key]: [userId, ...]}, notes: {[key]: string} }
```

`completed`/`notes` keys are `` `${year}-${month}-${day}-${choreId}` `` where `month` is 0-based (JS `getMonth()`).

**Sync pattern.** Every mutation (`toggleChore`, `saveNote`, `addChore`, `removeChore`, `removeUser`, joining) reads the latest state from `sharedDataRef.current` (not the `sharedData` state, to avoid stale-closure overwrites), builds a new full object, updates local state optimistically, then overwrites the whole document via `saveShared` (`setDoc`). An `onSnapshot` listener applies remote changes, ignores snapshots while `isSaving` is true, and is re-subscribed on window focus / visibility change. Writes are last-writer-wins on the entire document — preserve all top-level fields when building updates.

**Per-device state (localStorage via `useLocalStorage`).** `chore-user` (which user this device is), `chore-active` (which chore IDs are shown), `chore-theme`. If the stored user no longer exists in `users`, it is cleared and the `SetupScreen` is shown.

**Theming.** Styling is inline style objects. `THEMES` holds dark/light token sets; a module-level mutable `let T` is reassigned to the current theme at the top of each `ChoreTracker` render, and all components read colors from `T`. Add new colors as tokens in both themes rather than hard-coding them.

**Views.** `MonthView`, `WeekView`, and `DayView` render the calendar for `focusDate`; each uses `ChorePanel`/`ChoreCard` to toggle completion and edit notes. `useIsMobile` (< 640px) switches layouts.
