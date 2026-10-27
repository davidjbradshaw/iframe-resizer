// Each page records the parent callbacks it receives, for the tests to check
// that a callback ran rather than only that its effect is visible. A plain
// script, so a classic page can load it with <script src> as well as import it.
if (typeof window !== 'undefined') {
  window.callbacks = window.callbacks ?? []
  window.record = (callback, detail = {}) =>
    window.callbacks.push({ callback, ...detail })
}
