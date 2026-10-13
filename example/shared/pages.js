import { fileURLToPath } from 'node:url'

// The pages of each example; every page sets <body data-example> for the app
export const PAGES = ['index', 'two', 'width-inline', 'width-block']

// Build inputs for the vite.config.js at configUrl (its import.meta.url)
export default (configUrl) =>
  PAGES.map((page) => fileURLToPath(new URL(`${page}.html`, configUrl)))
