import { esModuleInterop } from '@iframe-resizer/common'
import { EXPAND, LOG_EXPANDED } from '@iframe-resizer/common/consts'
import type { IFrameComponent, IFrameOptions } from '@iframe-resizer/core'
import connectResizer from '@iframe-resizer/core'
import acg from 'auto-console-group'
import type { JSX } from 'solid-js'
import {
  createEffect,
  createMemo,
  onCleanup,
  onMount,
  splitProps,
  untrack,
} from 'solid-js'

import type { IFrameResizerProps } from './types'
import pickWireOptions from './wire-options'

export type { IFrameResizerMethods, IFrameResizerProps } from './types'

const createAutoConsoleGroup = esModuleInterop(acg)

// User callbacks core stores in settings and invokes later
const CALLBACKS = [
  'onReady',
  'onMessage',
  'onResized',
  'onScroll',
  'onMouseEnter',
  'onMouseLeave',
] as const

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
  ...CALLBACKS,
  'ref',
] as const

type Callback = (...args: unknown[]) => unknown

export default function IframeResizer(props: IFrameResizerProps): JSX.Element {
  let iframeEl!: IFrameComponent
  const [local, iframeProps] = splitProps(props, RESIZER_KEYS)
  const consoleGroup = createAutoConsoleGroup()

  const onBeforeClose = (): boolean => {
    consoleGroup.warn(
      'Close method is disabled, use Solid to remove the iframe.',
    )
    return false
  }

  // Each callback is passed to core as a wrapper that reads the current prop
  // when invoked, so a changed callback is used without re-binding. Only
  // callbacks that are present are passed: core enables mouse events on the
  // presence of the mouse handlers.
  const callbackOptions = (): Partial<IFrameOptions> =>
    Object.fromEntries(
      CALLBACKS.filter((name) => typeof local[name] === 'function').map(
        (name) => [
          name,
          (...args: unknown[]) =>
            untrack(() => local[name] as Callback)(...args),
        ],
      ),
    )

  // Which callbacks are present (not their identity); adding or removing
  // one re-binds so core's settings gain or lose the wrapper
  const callbackPresence = createMemo(() =>
    CALLBACKS.map((name) => typeof local[name] === 'function').join(','),
  )

  const buildOptions = (): IFrameOptions => ({
    ...pickWireOptions(local),
    onBeforeClose,
    ...callbackOptions(),
  })

  onMount(() => {
    // eslint-disable-next-line solid/reactivity -- ref is a one-shot setter
    const { ref: setRef } = local

    consoleGroup.label(`solid(${iframeEl.id})`)
    consoleGroup.event('setup')

    const resizer = connectResizer(buildOptions())(iframeEl)

    consoleGroup.expand(local.log === EXPAND || local.log === LOG_EXPANDED)
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
  // and routes through the update path in core. It tracks the wire options
  // and callback presence only; the options are then built untracked so a
  // new callback identity does not re-run it.
  let isFirstUpdate = true
  createEffect(() => {
    pickWireOptions(local)
    callbackPresence()

    if (isFirstUpdate) {
      isFirstUpdate = false
      return
    }
    if (!iframeEl) return

    connectResizer(untrack(buildOptions))(iframeEl)
  })

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe {...iframeProps} ref={iframeEl} />
}
