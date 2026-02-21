/**
 * @fileoverview Type definitions for @iframe-resizer/parent
 *
 * Types are re-exported from @iframe-resizer/core.
 * See packages/core/types.ts for canonical type definitions.
 */

import type {
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameOptions,
  IFrameResizedData,
  IFrameScrollData,
} from '@iframe-resizer/core'

export type {
  IFrameComponent,
  IFrameMessageData,
  IFrameMouseData,
  IFrameObject,
  IFrameOptions,
  IFrameResizedData,
  IFrameScrollData,
}

/**
 * Initialize iframe-resizer on one or more iframes.
 *
 * @param options - Configuration options for iframe-resizer.
 * @param target - CSS selector string or HTMLElement to target. Defaults to 'iframe'.
 * @returns Array of initialized iframe elements.
 */
declare function iframeResize(
  options: IFrameOptions,
  target?: string | HTMLElement,
): IFrameComponent[]

export default iframeResize
