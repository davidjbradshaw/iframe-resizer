<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'

  import connectResizer from '@iframe-resizer/core'
  import type {
    IFrameDirection,
    IFrameLogOption,
    IFrameMouseData,
    IFrameObject,
    IFrameOptions,
    IFrameScrollData,
  } from '@iframe-resizer/core'
  import { esModuleInterop } from '@iframe-resizer/common'
  import { COLLAPSE, EXPAND, LOG_EXPANDED } from '@iframe-resizer/common/consts'
  import acg from 'auto-console-group'

  // Deal with UMD not converting default exports to named exports
  const createAutoConsoleGroup = esModuleInterop(acg)

  export let license: string
  export let bodyBackground: string | undefined = undefined
  export let bodyMargin: string | undefined = undefined
  export let bodyPadding: string | undefined = undefined
  export let checkOrigin: boolean | undefined = undefined
  export let direction: IFrameDirection | undefined = undefined
  export let log: IFrameLogOption | undefined = undefined
  export let inPageLinks: boolean | undefined = undefined
  export let offsetSize: number | undefined = undefined
  export let scrolling: boolean | undefined = undefined
  export let tolerance: number | undefined = undefined
  export let warningTimeout: number | undefined = undefined

  const dispatch = createEventDispatcher()

  let iframe: HTMLIFrameElement
  let resizer: IFrameObject | null = null
  const consoleGroup = createAutoConsoleGroup()

  function buildOptions(): IFrameOptions {
    const options: IFrameOptions = {
      license,
      bodyBackground,
      bodyMargin,
      bodyPadding,
      checkOrigin,
      direction,
      log,
      inPageLinks,
      offsetSize,
      scrolling,
      tolerance,
      warningTimeout,
      onBeforeClose: () => {
        consoleGroup.event('Blocked Close Event')
        consoleGroup.warn(
          'Close method is disabled, use Svelte to remove iframe',
        )
        return false
      },
      onReady: (...args: any[]) => dispatch('ready', ...args),
      onMessage: (...args: any[]) => dispatch('message', ...args),
      onResized: (...args: any[]) => dispatch('resized', ...args),
      // Cancelable: preventDefault() in the handler stops the scroll, as
      // returning false from onScroll does
      onScroll: (data: IFrameScrollData) =>
        dispatch('scroll', data, { cancelable: true }),
      // Passing the mouse handlers enables mouse events in the child; whether
      // the page listens to them cannot be told here
      onMouseEnter: (data: IFrameMouseData) => dispatch('mouseenter', data),
      onMouseLeave: (data: IFrameMouseData) => dispatch('mouseleave', data),
    }

    // Drop unset props so they don't override core's defaults on update
    for (const key of Object.keys(options) as (keyof IFrameOptions)[]) {
      if (options[key] === undefined) delete options[key]
    }

    return options
  }

  onMount(() => {
    const options = buildOptions()
    consoleGroup.label(`svelte(${iframe.id})`)
    consoleGroup.event('setup')

    resizer = connectResizer(options)(iframe)

    consoleGroup.expand(log === EXPAND || log === LOG_EXPANDED)
    if ([COLLAPSE, EXPAND, true].includes(options.log as any)) {
      consoleGroup.log('Created Svelte component')
    }
  })

  // Re-bind when the resizer props change (after the initial bind in onMount).
  // Svelte runs this block during init, before bind:this has set `iframe`,
  // and again once it is set, so compare a key of the props rather than
  // counting runs.
  let lastOptionsKey: string | undefined
  $: {
    const optionsKey = JSON.stringify([
      license,
      bodyBackground,
      bodyMargin,
      bodyPadding,
      checkOrigin,
      direction,
      log,
      inPageLinks,
      offsetSize,
      scrolling,
      tolerance,
      warningTimeout,
    ])
    if (
      iframe &&
      lastOptionsKey !== undefined &&
      optionsKey !== lastOptionsKey
    ) {
      connectResizer(buildOptions())(iframe)
    }
    lastOptionsKey = optionsKey
  }

  onDestroy(() => {
    resizer?.disconnect()
    consoleGroup.endAutoGroup()
  })

  export function moveToAnchor(anchor: string) {
    resizer?.moveToAnchor(anchor)
  }

  export function sendMessage(msg: any, target?: string) {
    resizer?.sendMessage(msg, target)
  }
</script>

<iframe bind:this={iframe} {...$$restProps}></iframe>
