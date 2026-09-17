# Fixes

## Type Fixes

- **`LogOption` type broadened from `-1` to `number`** — allows the new numeric shorthands to be type-safe without requiring an explicit union for every value
- **`onBeforeResize` signature updated** — now receives `(newSize, event, direction)` instead of only `newSize`, giving callbacks the context needed to act on the event
- **`logExpand` type safety in Angular directive** — fixed incorrect type inference for the `logExpand` option

## Logic Fixes

- **URL param `?ifrlog` checks made explicit for all log levels** — each log level (`0`/`1`/`2`/`expanded`/`collapsed`) now has an explicit branch in `manual-logging.ts` rather than relying on fall-through to the `else` block; uses `EXPAND`/`COLLAPSE` string constants instead of inline literals
- **Alpine directive options evaluation** — fixed options not being evaluated correctly and updated event data display

## Refactoring (correctness improvements)

- **Union types derived from consts** — `Direction`, `LogOption`, and `ScrollOption` types in `core/types.ts` are now defined as `typeof CONST` unions rather than duplicating string literals, eliminating the risk of type and runtime value drifting apart
- **`OMIT` constant extracted** — removed a local `const OMIT = 'omit'` in `core/setup/scrolling.ts` in favour of the shared constant from `common/consts`

## Test Fixes

- **Intermittent race conditions in Jasmine integration tests** — added appropriate delays/guards to prevent flaky test failures
- **Missing test coverage for `?ifrlog=collapsed`** — added explicit test to ensure the string form of the URL param continues to work alongside the new numeric values
