import $ from 'jquery'
// Vitest globals are available; no direct imports needed

// Provide jQuery globals for tests
global.$ = $
global.jQuery = $

// No Jest shim: tests use Vitest `vi` directly.
