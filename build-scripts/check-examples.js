// Checks the demo pages against the library they demonstrate. The examples
// load js-dist, so they are never exercised by the test suite; this reads them
// statically instead, which is enough to catch a call or an attribute that no
// longer exists. The e2e child fixtures are the same pages against the current
// build, and had the same faults, so they are read too.

import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PAGE_DIRS = [join(ROOT, 'example'), join(ROOT, 'e2e/fixtures/child')]
const METHODS_FILE = join(ROOT, 'packages/child/methods/index.ts')
const CONSTS_FILE = join(ROOT, 'packages/common/consts.ts')
const LEGACY_DIR = join(ROOT, 'e2e/fixtures/legacy')

// Build outputs and installed packages hold stale copies of the examples
const SKIP_DIR = /(^|\/)(node_modules|dist|\.astro)(\/|$)/

const METHOD_CALL = /\bparentI[Ff]rame\.(\w+)\s*\(/g
const SIZE_ATTRIBUTE = /\b(data-iframe-[\w-]+)\b/g
const IN_PAGE_LINK = /<a\b[^>]*href="#"[^>]*>/g
// Shorthand in the child's API object, name: value in the legacy bundles
const MEMBER_NAME = /^\s*(\w+)\s*[,:]/
const ONCLICK = /onclick="([^"]*)"/
const LINK_ID = /\bid="([^"]+)"/
const LINK_CLASS = /\bclass="([^"]+)"/
const COMPAT_PAGE = /frame\.([1-5])\.html$/
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

// Walks the object literal that opens at "from", collecting the names of its
// own members. Brace-matched, so a member whose value spans braces, such as a
// function, neither truncates the list nor leaks its inner names into it.
function objectMembers(source, from) {
  const open = source.indexOf('{', from)

  if (open === -1 || from === -1) return null

  const members = new Set()
  let depth = 0

  for (let i = open; i < source.length; i += 1) {
    const char = source[i]

    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) return members
    } else if (char === '\n' && depth === 1) {
      const lineEnd = source.indexOf('\n', i + 1)
      const name = source.slice(i + 1, lineEnd).match(MEMBER_NAME)

      if (name) members.add(name[1])
    }
  }

  return null
}

// The public API object, so this check follows the library rather than a list
function childMethods() {
  const source = read(METHODS_FILE)
  const members = objectMembers(
    source,
    source.indexOf('win.parentIframe = Object.freeze('),
  )

  if (!members?.size)
    throw new Error(`Could not read the API object in ${METHODS_FILE}`)

  return members
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

    // A minified bundle has had its property names rewritten
    const members =
      source.split('\n').length < 50
        ? null
        : objectMembers(source, source.search(/\bparentIFrame\s*=/))

    if (members && members.size === 0)
      throw new Error(`Could not read the ${version} API object`)

    legacyCache.set(version, members)
  }

  return legacyCache.get(version)
}

// frame.<1-5>.html load one release's child, and the legacy fixture loads
// whichever its ?child says, so both are meant to use that release's names
function loadsLegacyChild(path, source) {
  return COMPAT_PAGE.test(path) || source.includes('/legacy/')
}

function apiFor(path, source, current) {
  const pinned = path.match(COMPAT_PAGE)

  if (pinned) return legacyApi(`v${pinned[1]}`)

  // Its child is chosen at runtime, so no one API applies
  return loadsLegacyChild(path, source) ? null : current
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

// A link with no onclick needs a listener, which the page can only bind
// through the link's id or class, and that listener has to call
// preventDefault. Looking for preventDefault anywhere in the file would pass
// any dead link on a page that cancels some other one.
function hasBoundHandler(source, link) {
  if (!source.includes('preventDefault')) return false

  const id = link.match(LINK_ID)?.[1]
  const classes = link.match(LINK_CLASS)?.[1].split(/\s+/) ?? []

  const selectors = [
    ...(id ? [`getElementById('${id}')`, `#${id}'`] : []),
    ...classes.map((name) => `.${name}'`),
  ]

  return selectors.some((selector) => source.includes(selector))
}

// An onclick that does not return false leaves the page navigating to "#"
function checkInPageLinks(source) {
  const problems = []

  for (const [link] of source.matchAll(IN_PAGE_LINK)) {
    const onclick = link.match(ONCLICK)?.[1]

    if (!onclick) {
      if (!hasBoundHandler(source, link)) {
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
  const api = apiFor(path, source, current)

  const problems = [
    ...checkMethods(source, api),
    ...checkAttributes(source, attributes),
    ...checkInPageLinks(source),
    ...(loadsLegacyChild(path, source) ? [] : checkDeprecated(source)),
  ]

  return problems.map((problem) => `${relative(ROOT, path)} ${problem}`)
}

const current = childMethods()
const attributes = sizeAttributes()
const files = PAGE_DIRS.flatMap((dir) => htmlFiles(dir))
const problems = files.flatMap((file) => checkFile(file, current, attributes))

if (problems.length > 0) {
  console.error(`\nDemo pages: ${problems.length} problem(s)\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('')
  process.exitCode = 1
} else {
  console.log(`Demo pages: ${files.length} checked, no problems found`)
}
