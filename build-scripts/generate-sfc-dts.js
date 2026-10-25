#!/usr/bin/env node

/**
 * Generates .d.ts files for SFC components (Vue, Svelte).
 *
 * Reads the public type names from core/types.ts, and the props and methods
 * from the Svelte component, so the SFC declarations stay in sync
 * automatically. A unit test checks the Vue component still matches.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const read = (file) => readFileSync(resolve(__dirname, '..', file), 'utf8')

const typesSource = read('packages/core/types.ts')
const svelteSource = read('packages/svelte/IframeResizer.svelte')

// Every public IFrame* name (type aliases + interfaces)
const typeExports = [
  ...typesSource.matchAll(/^export (?:type|interface) (IFrame\w+)\b/gm),
].map((m) => m[1])

// Just the type aliases (needed separately for SFC re-exports)
const OPTION_TYPES = [
  ...typesSource.matchAll(/^export type (IFrame\w+)\s*=/gm),
].map((m) => m[1])

// The options the components declare as props, and the methods they expose.
// Their callbacks are emits and events, so the published types offer just
// these. Taken from the Svelte component, as the two agree
export const COMPONENT_PROPS = [
  ...svelteSource.matchAll(/^\s*export let (\w+)/gm),
].map((m) => m[1])

const COMPONENT_METHODS = [
  ...svelteSource.matchAll(/^\s*export function (\w+)/gm),
].map((m) => m[1])

if (typeExports.length === 0) {
  throw new Error('No IFrame* type exports found in core/types.ts')
}

if (OPTION_TYPES.length === 0) {
  throw new Error('No IFrame* type aliases found in core/types.ts')
}

if (COMPONENT_PROPS.length === 0) {
  throw new Error('No props found in IframeResizer.svelte')
}

if (COMPONENT_METHODS.length === 0) {
  throw new Error('No methods found in IframeResizer.svelte')
}

const union = (names) => names.map((name) => `'${name}'`).join(' | ')

const PROPS_UNION = union(COMPONENT_PROPS)
const METHODS = `Pick<IFrameObject, ${union(COMPONENT_METHODS)}>`

const coreImports = typeExports.map((t) => `  ${t},`).join('\n')

// The events the Svelte component dispatches, and the type of their detail
const SVELTE_EVENTS = {
  ready: 'IFrameComponent',
  message: 'IFrameMessageData',
  resized: 'IFrameResizedData',
  scroll: 'IFrameScrollData',
  mouseenter: 'IFrameMouseData',
  mouseleave: 'IFrameMouseData',
}

export function generateVue() {
  return `import type { DefineComponent } from 'vue'
import type {
${coreImports}
} from '@iframe-resizer/core'

export type { ${OPTION_TYPES.join(', ')} }

export type IframeResizerProps = Pick<IFrameOptions, ${PROPS_UNION}>

export type IframeResizerMethods = ${METHODS}

export type IframeResizerEmits = {
  onReady: (iframe: IFrameComponent) => void
  onMessage: (data: IFrameMessageData) => void
  onResized: (data: IFrameResizedData) => void
  onScroll: (data: IFrameScrollData) => void
  onMouseEnter: (data: IFrameMouseData) => void
  onMouseLeave: (data: IFrameMouseData) => void
}

declare const IframeResizer: DefineComponent<
  IframeResizerProps,
  IframeResizerMethods,
  {},
  {},
  {},
  {},
  {},
  IframeResizerEmits
>

export default IframeResizer
`
}

export function generateSvelte() {
  return `import { SvelteComponent } from 'svelte'
import type { HTMLIframeAttributes } from 'svelte/elements'
import type {
${coreImports}
} from '@iframe-resizer/core'

export type { ${OPTION_TYPES.join(', ')} }

type IframeResizerOptions = Pick<IFrameOptions, ${PROPS_UNION}>

// The options it takes, and the iframe attributes it passes on, less those
// that share an option's name, such as scrolling
export type IframeResizerProps = IframeResizerOptions &
  Omit<HTMLIframeAttributes, keyof IframeResizerOptions>

// Its callbacks are events, as in on:resized
export type IframeResizerEvents = {
${Object.entries(SVELTE_EVENTS)
  .map(([name, detail]) => `  ${name}: CustomEvent<${detail}>`)
  .join('\n')}
}

export type IframeResizerMethods = ${METHODS}

declare class IframeResizer extends SvelteComponent<
  IframeResizerProps,
  IframeResizerEvents
> {}

// Merged with the class, so an instance has the methods core declares
interface IframeResizer extends IframeResizerMethods {}

export default IframeResizer
`
}

export default function generateSfcDts() {
  writeFileSync(
    resolve(__dirname, '../dist/vue/iframe-resizer.vue.d.ts'),
    generateVue(),
  )
  writeFileSync(
    resolve(__dirname, '../dist/svelte/IframeResizer.svelte.d.ts'),
    generateSvelte(),
  )
  console.log('Generated SFC type declarations')
}

// Allow running directly: node build-scripts/generate-sfc-dts.js. There is
// no entry path under node -e, where this module can only be imported
const entry = process.argv[1]

if (entry && import.meta.url === pathToFileURL(entry).href) {
  generateSfcDts()
}
