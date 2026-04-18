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

function generateVue() {
  // Vue needs the callback data types for emit signatures
  const vueTypes = typeExports.filter(
    (t) => t !== 'IFrameScrollData' && t !== 'IFrameMouseData',
  )

  return `import type { DefineComponent } from 'vue'
import type {
${vueTypes.map((t) => `  ${t},`).join('\n')}
} from '@iframe-resizer/core'

export type { ${OPTION_TYPES.join(', ')} }

export type IframeResizerProps = Omit<IFrameOptions, 'id' | 'onBeforeClose'>

export type IframeResizerMethods = Pick<IFrameObject, 'moveToAnchor' | 'sendMessage'>

export type IframeResizerEmits = {
  onReady: (iframe: IFrameComponent) => void
  onMessage: (data: IFrameMessageData) => void
  onResized: (data: IFrameResizedData) => void
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

function generateSvelte() {
  const svelteBase = 'SvelteComponent'
  const classDecl = `declare class IframeResizer extends ${svelteBase}<IframeResizerProps>`

  return `import { SvelteComponent } from 'svelte'
import type {
${OPTION_TYPES.map((t) => `  ${t},`).join('\n')}
  IFrameOptions,
} from '@iframe-resizer/core'

export type { ${OPTION_TYPES.join(', ')} }

export type IframeResizerProps = Omit<IFrameOptions, 'id' | 'onBeforeClose'> & {
  [key: string]: any
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
