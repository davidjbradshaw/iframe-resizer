// Vitest globals are available; no direct imports needed

// Provide jQuery globals for tests; jQuery won't load without a document,
// as in the server-side rendering tests
if (globalThis.document) {
  const { default: $ } = await import('jquery')
  global.$ = $
  global.jQuery = $
}

// jsdom has no User Timing API, which the child uses to time its size checks
performance.mark ??= () => {}
performance.measure ??= () => ({ duration: 0 })

// No Jest shim: tests use Vitest `vi` directly.
