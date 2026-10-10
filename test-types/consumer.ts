// Imports every published package's types the way a user would. Compiled
// against dist by build-scripts/test-types.js; not part of the build.
import type { IframeResizerDirective } from '@iframe-resizer/angular'
import type { IFrameOptions as AlpineOptions } from '@iframe-resizer/alpine'
import type { IFrameOptions as AstroOptions } from '@iframe-resizer/astro/types'
import type {
  IFramePageOptions,
  IFrameParentAPI,
  IFrameVersion,
} from '@iframe-resizer/child'
import type { IFrameVersion as CommonVersion } from '@iframe-resizer/common'
import type {
  IFrameDirection,
  IFrameLogOption,
  IFrameOptions,
  IFrameScrollOption,
} from '@iframe-resizer/core'
import type iframeResize from '@iframe-resizer/parent'
import type { IFrameObject } from '@iframe-resizer/parent'
import type ReactIframeResizer from '@iframe-resizer/react'
import type {
  IFrameForwardRef,
  IFrameResizerProps as ReactProps,
} from '@iframe-resizer/react'
import type SolidIframeResizer from '@iframe-resizer/solid'
import type {
  IFrameResizerMethods,
  IFrameResizerProps as SolidProps,
  IFrameOptions as SolidOptions,
} from '@iframe-resizer/solid'
import type SvelteIframeResizer from '@iframe-resizer/svelte'
import type { IFrameOptions as SvelteOptions } from '@iframe-resizer/svelte'
import type VueIframeResizer from '@iframe-resizer/vue'
import type { IFrameOptions as VueOptions } from '@iframe-resizer/vue'
import type VueSfc from '@iframe-resizer/vue/sfc'
import type { IframeResizerElement } from '@iframe-resizer/web-component'

export type Published = [
  IframeResizerDirective,
  AlpineOptions,
  AstroOptions,
  IFramePageOptions,
  IFrameParentAPI,
  IFrameVersion,
  CommonVersion,
  IFrameOptions,
  typeof iframeResize,
  IFrameObject,
  typeof ReactIframeResizer,
  IFrameForwardRef,
  ReactProps,
  typeof SolidIframeResizer,
  IFrameResizerMethods,
  SolidProps,
  SolidOptions,
  typeof SvelteIframeResizer,
  SvelteOptions,
  typeof VueIframeResizer,
  VueOptions,
  typeof VueSfc,
  IframeResizerElement,
]

// The option types are unions built from the consts, so they must reject
// other values; if they degrade to any, these lines stop being errors
// @ts-expect-error not a direction
export const direction: IFrameDirection = 'sideways'
// @ts-expect-error not a log option
export const log: IFrameLogOption = 'loud'
// @ts-expect-error not a scrolling option
export const scrolling: IFrameScrollOption = 'sometimes'
