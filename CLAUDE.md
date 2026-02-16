# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iframe-resizer is a library that automatically resizes iframes to fit their content. It works via a two-part system: a **parent** script on the host page and a **child** script inside the iframe, communicating over `postMessage` with a colon-separated string protocol (prefixed `[iFrameSizer]`).

## Monorepo Structure

This is a manual monorepo (no npm workspaces). Packages under `packages/` do not have their own `package.json` — those are generated at build time into `dist/`.

| Package | Role |
|---------|------|
| `common` | Shared constants (`consts.js`), utilities, pub/sub |
| `core` | Parent-side engine: `connectResizer(options)` → `(iframe) => resizer` |
| `parent` | Distribution wrappers (ESM/UMD/IIFE) around core's factory |
| `child` | Child iframe engine: observers, size calculation, sends dimensions to parent |
| `react` | React component wrapping core |
| `vue` | Vue 3 SFC + plugin wrapping core |
| `angular` | Angular standalone directive wrapping core |
| `jquery` | jQuery plugin wrapping core |
| `legacy` | v4 backward-compat bundle (parent + child + jquery) |
| `smoke` | Import smoke tests for all modules |

**Dependency flow:** `common` ← `core` ← `parent`/`react`/`vue`/`angular`/`jquery`; `common` ← `child` (independent of core). Parent and child communicate only via `postMessage`.

## Build System

Despite the filename, `vite.config.js` is a **Rollup** configuration driven programmatically by `vite-build.js`.

```bash
npm run build:dev      # DEBUG=1, builds IIFE bundles to js/ only (fast)
npm run build:prod     # Full production build: eslint + all formats to dist/ and js/
npm run build:beta     # Beta build with sourcemaps
```

**Output directories:**
- `dist/` — npm-publishable packages (ESM/CJS/UMD per package)
- `js/` — Browser IIFE bundles
- `test-js/` — UMD builds for Karma integration tests
- `js-dist/` — Static copy of js/ for e2e tests

**Build environment flags:** `DEBUG=1`, `BETA=1`, `TEST=1`, `WATCH=1`

Production builds strip debug logging (`@rollup/plugin-strip`) and test code (markers: `/* TEST CODE START */` / `/* TEST CODE END */`).

## Testing

Three test tiers:

```bash
npm test              # Full suite: eslint + build + e2e + integration + unit
npm run test:unit     # Vitest only (fast, use during development)
npm run test:int      # Karma/Jasmine integration tests (needs test-js/ built)
npm run test:e2e      # Playwright e2e (needs js-dist/ and http-server)
```

**Unit tests (Vitest):** Co-located as `*.test.js` next to source in `packages/`. Environment: jsdom. Coverage: V8.
```bash
npx vitest run packages/core/router.test.js     # Run single test file
npm run test:watch                               # Watch mode
```

**Integration tests (Karma + Jasmine):** In `spec/`. Uses RequireJS + ChromeHeadless. Tests real postMessage between parent/child.

**E2E tests (Playwright):** In `e2e/`. Serves `example/html/` pages on localhost:8080.

### Test conventions
- Use extensionless imports in tests
- Reset Vitest module state per test when relying on internal singletons
- Prefer `vi.mock` with factory functions; call `vi.restoreAllMocks()` in `beforeEach`

## Linting

```bash
npm run eslint:fix    # Lint and auto-fix (run before commits)
npm run eslint        # Lint only
```

ESLint config: `.eslintrc.json` (extends eslint-config-auto). Prettier: no semicolons, single quotes, trailing commas, 2-space indent.

## Code Style

- ES modules (`"type": "module"` in package.json)
- No semicolons, single quotes, trailing commas
- Node >= 20 required

## Key Architectural Patterns

- **Curried factory:** `connectResizer(options)` returns `(iframe) => resizer`, allowing shared options across multiple iframes
- **Shared mutable settings:** Parent stores per-iframe config in a plain object keyed by iframe ID (`core/values/settings.js`)
- **String protocol:** Core messages use colon-separated strings (not JSON) for backward compatibility. Only user messages and pageInfo use JSON.
- **Same-origin optimization:** When parent/child share an origin, messages bypass postMessage via `window.iframeChildListener` / `window.iframeParentListener`
- **Frame-based throttling:** Child's `sendSize()` uses `requestAnimationFrame` to coalesce resize messages
- **User code isolation:** Callbacks invoked via `setTimeout(fn, 0)` to prevent user errors from crashing the library (except `onBeforeClose`/`onScroll` which need sync returns)
- **`once()` guard:** Global message listener setup runs exactly once via the `once()` utility
