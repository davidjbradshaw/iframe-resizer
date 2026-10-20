# Review confirmation tests

Each test here reproduces one finding from the October 2026 code review, numbered as in the `dev-review` pull request. The tests assert the correct behaviour, so they fail until the finding is fixed. They are not part of `npm test`: as each fix lands, its test moves into `e2e/tests` or next to the source, and leaves this folder. A finding that won't be fixed has its test removed.

Build first (`npm run build:dev`), then run from the repo root, naming the
test. A test with its own app under `e2e/apps` needs that built too, with
`bash build-scripts/build-e2e-app.sh <framework>`.

```bash
npx playwright test -c e2e/confirm/playwright.config.js e2e/confirm/<test>.spec.js
```
