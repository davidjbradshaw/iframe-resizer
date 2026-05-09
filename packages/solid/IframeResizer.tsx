import { esModuleInterop } from '@iframe-resizer/common'
import type { IFrameComponent } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import type { JSX } from 'solid-js'
import { createEffect, onCleanup, onMount, splitProps } from 'solid-js'

import type { IFrameResizerProps } from './types'
import pickWireOptions from './wire-options'

export type { IFrameResizerMethods, IFrameResizerProps } from './types'

const createAutoConsoleGroup = esModuleInterop(acg)

const RESIZER_KEYS = [
  'license',
  'bodyBackground',
  'bodyMargin',
  'bodyPadding',
  'checkOrigin',
  'direction',
  'inPageLinks',
  'log',
  'offsetSize',
  'scrolling',
  'tolerance',
  'warningTimeout',
  'onReady',
  'onMessage',
  'onResized',
  'onScroll',
  'onMouseEnter',
  'onMouseLeave',
  'ref',
] as const

export default function IframeResizer(props: IFrameResizerProps): JSX.Element {
  let iframeEl!: IFrameComponent
  const [local, iframeProps] = splitProps(props, RESIZER_KEYS)
  const consoleGroup = createAutoConsoleGroup()

  onMount(() => {
    const {
      onReady,
      onMessage,
      onResized,
      onScroll,
      onMouseEnter,
      onMouseLeave,
      ref: setRef,
      // eslint-disable-next-line solid/reactivity -- intentional: this is a one-shot setup; the library does not support re-initializing an element
    } = local

    consoleGroup.label(`solid(${iframeEl.id})`)
    consoleGroup.event('setup')

    const options: Record<string, any> = {
      ...pickWireOptions(local),
      onBeforeClose: () => {
        consoleGroup.warn(
          'Close method is disabled, use Solid to remove the iframe.',
        )
        return false
      },
      ...Object.fromEntries(
        Object.entries({
          onReady,
          onMessage,
          onResized,
          onScroll,
          onMouseEnter,
          onMouseLeave,
        }).filter(([, v]) => v !== undefined),
      ),
    }

    const resizer = connectResizer(options)(iframeEl)

    consoleGroup.expand(local.log === 'expanded')
    if (local.log) consoleGroup.log('Created Solid component')

    if (typeof setRef === 'function') {
      setRef({
        getElement: () => iframeEl,
        moveToAnchor: (anchor) => resizer?.moveToAnchor(anchor),
        sendMessage: (message, targetOrigin) =>
          resizer?.sendMessage(message, targetOrigin),
      })
    }

    onCleanup(() => {
      consoleGroup.endAutoGroup()
      resizer?.disconnect()
    })
  })

  // Re-bind when iframe-resizer-relevant props change. The first call inside
  // onMount establishes the binding; this effect tracks subsequent changes
  // and routes through the update path in core.
  let isFirstUpdate = true
  createEffect(() => {
    const updateOptions = pickWireOptions(local)

    if (isFirstUpdate) {
      isFirstUpdate = false
      return
    }
    if (!iframeEl) return

    connectResizer(updateOptions)(iframeEl)
  })

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...iframeProps} ref={iframeEl} />
}
