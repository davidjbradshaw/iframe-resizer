// Checks the example pages against the library they demonstrate. The examples
// load js-dist, so they are never exercised by the test suite; this reads them
// statically instead, which is enough to catch a call or an attribute that no
// longer exists.

import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const EXAMPLE_DIR = join(ROOT, 'example')
const METHODS_FILE = join(ROOT, 'packages/child/methods/index.ts')
const CONSTS_FILE = join(ROOT, 'packages/common/consts.ts')
const LEGACY_DIR = join(ROOT, 'e2e/fixtures/legacy')

// Build outputs and installed packages hold stale copies of the examples
const SKIP_DIR = /(^|\/)(node_modules|dist|\.astro)(\/|$)/

const METHOD_CALL = /\bparentI[Ff]rame\.(\w+)\s*\(/g
const SIZE_ATTRIBUTE = /\b(data-iframe-[\w-]+)\b/g
const IN_PAGE_LINK = /<a\b[^>]*href="#"[^>]*>/g
const PROPERTY_NAME = /(\w+)\s*:/g
const ONCLICK = /onclick="([^"]*)"/
const RETURNS = /\breturn\b|preventDefault/
// Returning an assignment returns the value assigned, which is truthy
const RETURNS_ASSIGNMENT = /\breturn\s[^;]*[^!<=>]=[^=]/

// Shown in the examples, so they should be the current spelling
const DEPRECATED = [
  {
    pattern: /\bdata-iframe-size\b/,
    old: 'data-iframe-size',
    current: 'data-iframe-resize',
  },
  {
    pattern: /\bsizeSelector\b/,
    old: 'sizeSelector',
    current: 'resizeSelector',
  },
  {
    pattern: /\biFrameResizer\b/,
    old: 'iFrameResizer',
    current: 'iframeResizer',
  },
]

const read = (path) => readFileSync(path, 'utf8')

function htmlFiles(dir) {
  const found = []

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stat = lstatSync(path)

    // Every framework example links its child dir to example/shared/child, so
    // following them would report the same page once per framework
    if (stat.isSymbolicLink() || SKIP_DIR.test(path)) continue

    if (stat.isDirectory()) {
      found.push(...htmlFiles(path))
    } else if (entry.endsWith('.html')) {
      found.push(path)
    }
  }

  return found
}

// The public API object, so this check follows the library rather than a list
function childMethods() {
  const block = read(METHODS_FILE).match(
    /win\.parentIframe = Object\.freeze\({([^}]*)}/,
  )

  if (!block)
    throw new Error(`Could not find the API object in ${METHODS_FILE}`)

  return new Set(
    block[1]
      .split(',')
      .map((line) => line.trim())
      .filter(Boolean),
  )
}

function sizeAttributes() {
  const consts = read(CONSTS_FILE).matchAll(
    /^export const \w+ = '(data-iframe-[\w-]+)'$/gm,
  )

  return new Set([...consts].map((match) => match[1]))
}

// A v1-v5 compat page gets the API of the child script it loads, not today's.
// null means the bundle is minified, so its API cannot be read back out of it;
// v5 is the only one, and its API matches today's anyway.
const legacyCache = new Map()

function legacyApi(version) {
  if (!legacyCache.has(version)) {
    const source = read(
      join(LEGACY_DIR, version, 'iframeResizer.contentWindow.js'),
    )

    legacyCache.set(
      version,
      source.split('\n').length < 50
        ? null
        : new Set([...source.matchAll(PROPERTY_NAME)].map((match) => match[1])),
    )
  }

  return legacyCache.get(version)
}

function isCompatPage(path) {
  return /frame\.[1-5]\.html$/.test(path)
}

function apiFor(path, current) {
  const legacy = path.match(/frame\.([1-5])\.html$/)
  return legacy ? legacyApi(`v${legacy[1]}`) : current
}

function checkMethods(source, api) {
  if (!api) return []

  return [...source.matchAll(METHOD_CALL)]
    .map(([, method]) => method)
    .filter((method) => !api.has(method))
    .map(
      (method) =>
        `calls parentIframe.${method}(), which the child it loads does not have`,
    )
}

function checkAttributes(source, attributes) {
  return [...source.matchAll(SIZE_ATTRIBUTE)]
    .map(([, attribute]) => attribute)
    .filter((attribute) => !attributes.has(attribute))
    .map(
      (attribute) =>
        `uses ${attribute}, which is not an attribute the child reads`,
    )
}

function checkDeprecated(source) {
  return DEPRECATED.filter(({ pattern }) => pattern.test(source)).map(
    ({ old, current }) =>
      `uses the deprecated ${old}; the examples should show ${current}`,
  )
}

// An onclick that does not return false leaves the page navigating to "#"
function checkInPageLinks(source) {
  const problems = []

  for (const [link] of source.matchAll(IN_PAGE_LINK)) {
    const onclick = link.match(ONCLICK)?.[1]

    if (!onclick) {
      // The handler may be bound with addEventListener instead, in which case
      // it has to call preventDefault to stop the link navigating to "#"
      if (!source.includes('preventDefault')) {
        problems.push(
          `has an href="#" link that nothing cancels: ${link.trim()}`,
        )
      }
    } else if (!RETURNS.test(onclick)) {
      problems.push(`has an href="#" link that never returns false: ${onclick}`)
    } else if (RETURNS_ASSIGNMENT.test(onclick)) {
      problems.push(
        `has an href="#" link that returns an assignment: ${onclick}`,
      )
    }
  }

  return problems
}

function checkFile(path, current, attributes) {
  const source = read(path)
  const api = apiFor(path, current)

  const problems = [
    ...checkMethods(source, api),
    ...checkAttributes(source, attributes),
    ...checkInPageLinks(source),
    // A compat page is meant to show the old names
    ...(isCompatPage(path) ? [] : checkDeprecated(source)),
  ]

  return problems.map((problem) => `${relative(ROOT, path)} ${problem}`)
}

const current = childMethods()
const attributes = sizeAttributes()
const files = htmlFiles(EXAMPLE_DIR)
const problems = files.flatMap((file) => checkFile(file, current, attributes))

if (problems.length > 0) {
  console.error(`\nExample pages: ${problems.length} problem(s)\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('')
  process.exitCode = 1
} else {
  console.log(`Example pages: ${files.length} checked, no problems found`)
}
