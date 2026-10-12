# Review confirmation tests

Each test here reproduces one finding from the October 2026 code review, numbered as in the `dev-review` pull request. The tests assert the correct behaviour, so they fail until the finding is fixed. They are not part of `npm test`: as each fix lands, its test moves into `e2e/tests` or next to the source, and leaves this folder.

Build first (`npm run build:dev`), then run from the repo root:

```bash
npx playwright test -c e2e/confirm/playwright.config.js e2e/confirm/28-title-observer.spec.js
npx vitest run -c e2e/confirm/vitest.config.mjs e2e/confirm/46-angular-ssr.test.ts
```

Three tests need an app built first:

- 16.1 (React): `bash build-scripts/build-e2e-app.sh react`
- 16.2 (Solid): `cd e2e/apps/solid/confirm-16.2 && npx vite build`
- 47 (Angular): `bash build-scripts/build-e2e-app.sh angular`

The Angular server-side rendering test (46) installs its own small project in `angular-ssr/` on first run.
