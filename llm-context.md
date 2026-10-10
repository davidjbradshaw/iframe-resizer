# LLM Context

Date: 2026-02-10

## Status

- Test runner: Vitest v4 with jsdom; coverage via v8.
- Linting: ESLint+Prettier enforced; prefer `npm run eslint:fix` before commits.
- CI: Dev branch mirrors master actions; PR branch `vitest` kept green.
- Coverage: ~91.7% statements, ~75% branches (V8 report).

## Recent Changes

- Persisted throttle gate in `core/monitor/sendInfoToIframe` to coalesce same-frame events per id.
- Added direct throttle tests for `sendInfoToIframe` and expanded monitor throttle coverage.
- Stabilized auto size branches in child package; added targeted tests.
- Vue SFC mounted lifecycle covered; React component smoke stabilized.
- Ran `eslint:fix` prior to commits; tests green.

## Next Targets

- core/monitor/common: expand branch coverage (listeners setup, observer stop, early-return path).
- core/router: add more branch tests around scroll and monitor start/stop variations.
- child/observed/mutation & observers/overflow: add deeper branch tests.
- core/events/wrapper: cover remaining branches.

## Notes

- Use extensionless imports in tests.
- Reset Vitest module state per test when relying on internal singletons.
- Prefer `vi.mock` with factory functions; call `vi.restoreAllMocks()` in `beforeEach`.
