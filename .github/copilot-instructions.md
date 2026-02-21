# Copilot Instructions for iframe-resizer

## Repository Summary

`iframe-resizer` is a JavaScript library that automatically resizes iframes to match their content size. It supports cross-domain iframes and provides additional browser API features such as scroll control, viewport/position info, in-page linking, and message passing between parent and iframe pages. The library supports Vanilla JS, React, Vue, Angular, and jQuery.

This is a **monorepo** (Node.js, ES modules, `"type": "module"` in root `package.json`) targeting Node.js ≥ 20. It uses **Vite/Rollup** (via `build-scripts/`) to build distributable packages.

## Project Layout

```
/
├── packages/            # Source packages
│   ├── core/            # Core resizer logic (JS + TS); consumed by parent and child
│   ├── parent/          # Parent-page integration (iife, esm, umd, cjs entry points)
│   ├── child/           # Child-page (iframe content) integration
│   ├── react/           # React component wrapper
│   ├── vue/             # Vue 3 SFC component wrapper
│   ├── angular/         # Angular standalone directive wrapper
│   ├── jquery/          # jQuery plugin wrapper
│   ├── legacy/          # v4-compatible legacy API
│   ├── common/          # Shared constants, utilities, pub/sub
│   └── smoke/           # Import smoke tests for all modules
├── build/               # Rollup build helpers (banner, output, pkgJson, plugins)
├── build-scripts/       # Node scripts that drive Vite/Rollup builds
│   ├── build-all.js     # Entry point for all build commands
│   ├── build-browser.js # IIFE bundle builds (js/ output)
│   └── build-tests.js   # Test artifact builds (test-js/ output)
├── vite.config.js       # Vite library build config (production npm packages)
├── vite-build.js        # Programmatic Rollup build runner
├── vitest.config.mjs    # Vitest unit test configuration
├── js/                  # IIFE output for direct browser use (generated)
├── js-dist/             # Static copy of js/ for e2e tests (generated)
├── dist/                # NPM package output (generated)
├── test-js/             # UMD builds for Karma integration tests (generated)
├── spec/                # Karma/Jasmine integration tests
├── e2e/                 # Playwright end-to-end tests
├── example/             # Example pages
├── karma.conf.cjs       # Karma integration test configuration
├── playwright.config.js # Playwright e2e test configuration
├── .eslintrc.json       # ESLint configuration (extends "auto")
├── .prettierrc          # Prettier configuration
├── babel.config.cjs     # Babel configuration
└── package.json         # Root package with all scripts
```

## Build & Test Commands

Always run `npm install` before building or testing (the CI pipeline uses `npm ci`).

### Linting

```bash
npm run eslint          # Lint packages/, build/, build-scripts/, vite.config/, root JS files
npm run eslint:fix      # Lint and auto-fix
```

ESLint config is in `.eslintrc.json` (extends `"auto"`). Ignored paths: `js/*`, `dist/*`, `test-js/*`, `js-dist/*`, `spec/*`, `example/*`, `coverage/*`.

### Building

```bash
npm run build:dev       # Development build (DEBUG=1, sourcemaps) → js/ only (fast)
npm run build:prod      # Production build (eslint:fix + all formats) → dist/ and js/
```

Build is driven by `build-scripts/build-all.js`. Environment flags: `DEBUG=1`, `BETA=1`, `TEST=1`, `WATCH=1`. Production builds strip debug logging and test-only code.

### Testing

```bash
# Unit tests (Vitest) — no build required; fastest for development
npm run test:unit       # Run Vitest (coverage enabled)
npm run test:watch      # Vitest watch mode

# Integration tests (Karma + Jasmine) — requires a build first
npm run vite:test       # Build test artifacts into test-js/ (runs eslint:fix first)
npm run test:int        # Run Karma tests (ChromeHeadless)

# E2E tests (Playwright) — requires a running server
npx playwright install chromium   # First-time setup
npm run serve:e2e &               # Start http-server on port 8080
npm run test:e2e                  # Run all Playwright tests

# Full test suite — used in CI
npm run test:ci         # vite:test:ci + test:e2e + test:int + test:unit
```

The CI workflows run `npm ci` then the relevant test command on Node.js 22.x.

### Key `test:ci` sequence

1. `npm run vite:test:ci` — Vite/Rollup build for test artifacts (no eslint:fix, sets `TEST=1`)
2. `npm run test:e2e` — Playwright e2e tests
3. `npm run test:int` — Karma/Jasmine integration tests in ChromeHeadless
4. `npm run test:unit` — Vitest unit tests

## Architecture Notes

- **`packages/common/`** — shared constants and utilities; imported by both `core` and `child`.
- **`packages/core/`** — parent-side engine; `connectResizer(options)` returns `(iframe) => resizer`. Contains TypeScript source files (`.ts`) alongside JS.
- **`packages/parent/`** — distribution wrappers (ESM/UMD/IIFE) around core's factory.
- **`packages/child/`** — loaded inside the iframe; exposes `parentIFrame` global.
- **`packages/react/`** — React component; uses Babel with `@babel/runtime`.
- **`packages/vue/`** — Vue 3 SFC component; uses TypeScript.
- **`packages/legacy/`** — backwards-compatible API for iframe-resizer v4.
- **`packages/smoke/`** — import smoke tests verifying all module entry points resolve.

**Dependency flow:** `common` ← `core` ← `parent`/`react`/`vue`/`angular`/`jquery`; `common` ← `child` (independent of core). Parent and child communicate only via `postMessage`.

## CI / GitHub Workflows

- **`vitest.js.yml`** — unit tests: `npm ci` + `npm run test:unit` on Node.js 22.x (push/PR to `master` and `dev`).
- **`jasmine.yml`** — integration tests: `npm ci` + `vite:test:ci` + `test:int` on Node.js 22.x.
- **`playwright.yml`** — Playwright e2e tests.
- **`eslint.yml`** — ESLint check.
- **`claude.yml`** / **`claude-code-review.yml`** — AI-assisted code review.

## Important Notes

- The root `package.json` uses `"type": "module"` — all `.js` files are ES modules by default. Configuration files that must be CommonJS use the `.cjs` extension (`karma.conf.cjs`, `babel.config.cjs`).
- Do not edit files in `js/`, `js-dist/`, `dist/`, or `test-js/` — these are generated by the build.
- Unit test files (Vitest) live alongside source files in `packages/*/` and use the `.test.js` or `.test.ts` extension.
- Integration tests live in `spec/` and use Karma + Jasmine (not Vitest).
- Packages under `packages/` do not have their own `package.json` — those are generated at build time into `dist/`.
