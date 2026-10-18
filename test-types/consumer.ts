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
  IFrameMouseData,
  IFrameOptions,
  IFrameScrollData,
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
import type { ComponentEvents, ComponentProps } from 'svelte'

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

// onBeforeResize receives the trigger event; a callback written without it
// still assigns
export const pageOptions: IFramePageOptions = {
  onBeforeResize: (newSize, eventType) =>
    eventType === 'init' ? newSize : Math.min(newSize, 600),
}
export const legacyPageOptions: IFramePageOptions = {
  onBeforeResize: (newSize: number) => newSize,
}

// The React component's onScroll and mouse callbacks get iframe-resizer
// data, not React's DOM events, so typed handlers must be accepted
export const reactCallbacks: ReactProps = {
  license: 'GPLv3',
  onScroll: (data: IFrameScrollData) => data.top > 0,
  onMouseEnter: (data: IFrameMouseData) => console.log(data.iframe.id),
  onMouseLeave: (data) => console.log(data.iframe.id),
}

// The Vue and Svelte types only offer the options the components take, so
// these stop being errors if they advertise every core option again
type VueProps = InstanceType<typeof VueSfc>['$props']
type SvelteProps = ComponentProps<SvelteIframeResizer>

export const vueProps: VueProps = { license: 'GPLv3', scrolling: 'auto' }
export const vueWaitForLoad: VueProps = {
  license: 'GPLv3',
  // @ts-expect-error waitForLoad is not a prop of the Vue component
  waitForLoad: true,
}

export const svelteProps: SvelteProps = {
  license: 'GPLv3',
  scrolling: true,
  src: '/child.html',
}
export const svelteOnResized: SvelteProps = {
  license: 'GPLv3',
  // @ts-expect-error onResized is an event of the Svelte component, not a prop
  onResized: () => {},
}

// Its events carry the data core passes to the callbacks
type SvelteEvents = ComponentEvents<SvelteIframeResizer>
export const svelteResized = (event: SvelteEvents['resized']): number =>
  event.detail.height
// @ts-expect-error resize is not one of its events
export type SvelteNotAnEvent = SvelteEvents['resize']
