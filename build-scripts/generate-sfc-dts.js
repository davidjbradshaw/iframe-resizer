#!/usr/bin/env node

/**
 * Generates .d.ts files for SFC components (Vue, Svelte).
 *
 * Reads the public type names from core/types.ts so the SFC declarations
 * stay in sync automatically.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const typesSource = readFileSync(
  resolve(__dirname, '../packages/core/types.ts'),
  'utf8',
)

// Every public IFrame* name (type aliases + interfaces)
const typeExports = [
  ...typesSource.matchAll(/^export (?:type|interface) (IFrame\w+)\b/gm),
].map((m) => m[1])

// Just the type aliases (needed separately for SFC re-exports)
const OPTION_TYPES = [
  ...typesSource.matchAll(/^export type (IFrame\w+)\s*=/gm),
].map((m) => m[1])

if (typeExports.length === 0) {
  throw new Error('No IFrame* type exports found in core/types.ts')
}

if (OPTION_TYPES.length === 0) {
  throw new Error('No IFrame* type aliases found in core/types.ts')
}

// The options the Vue and Svelte components declare as props. Their
// callbacks are emits and events, so the published types offer just these
export const COMPONENT_PROPS = [
  'license',
  'bodyBackground',
  'bodyMargin',
  'bodyPadding',
  'checkOrigin',
  'direction',
  'log',
  'inPageLinks',
  'offsetSize',
  'scrolling',
  'tolerance',
  'warningTimeout',
]

const PROPS_UNION = COMPONENT_PROPS.map((prop) => `'${prop}'`).join(' | ')

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
${typeExports.map((t) => `  ${t},`).join('\n')}
} from '@iframe-resizer/core'

export type { ${OPTION_TYPES.join(', ')} }

export type IframeResizerProps = Pick<IFrameOptions, ${PROPS_UNION}>

export type IframeResizerMethods = Pick<IFrameObject, 'moveToAnchor' | 'sendMessage'>

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
  const svelteBase = 'SvelteComponent'
  const classDecl = `declare class IframeResizer extends ${svelteBase}<IframeResizerProps, IframeResizerEvents>`

  return `import { SvelteComponent } from 'svelte'
import type { HTMLIframeAttributes } from 'svelte/elements'
import type {
${OPTION_TYPES.map((t) => `  ${t},`).join('\n')}
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameOptions,
  IFrameResizedData,
  IFrameScrollData,
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

export interface IframeResizerMethods {
  moveToAnchor(anchor: string): void
  sendMessage(msg: any, target?: string): void
}

${classDecl} {
  moveToAnchor(anchor: string): void
  sendMessage(msg: any, target?: string): void
}

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

// Allow running directly: node build-scripts/generate-sfc-dts.js
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSfcDts()
}
