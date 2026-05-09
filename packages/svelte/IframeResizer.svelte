<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'

  import connectResizer from '@iframe-resizer/core'
  import type { IFrameLogOption, IFrameObject } from '@iframe-resizer/core'
  import { esModuleInterop } from '@iframe-resizer/common'
  import { COLLAPSE, EXPAND } from '@iframe-resizer/common/consts'
  import acg from 'auto-console-group'

  // Deal with UMD not converting default exports to named exports
  const createAutoConsoleGroup = esModuleInterop(acg)

  export let license: string
  export let bodyBackground: string | undefined = undefined
  export let bodyMargin: string | undefined = undefined
  export let bodyPadding: string | undefined = undefined
  export let checkOrigin: boolean | undefined = undefined
  export let direction: string | undefined = undefined
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

  function buildOptions(): Record<string, any> {
    const wireProps: Record<string, any> = {
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
    }
    return {
      ...Object.fromEntries(
        Object.entries(wireProps).filter(([, value]) => value !== undefined),
      ),
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
    }
  }

  onMount(() => {
    const options = buildOptions()
    consoleGroup.label(`svelte(${iframe.id})`)
    consoleGroup.event('setup')

    resizer = connectResizer(options)(iframe)

    consoleGroup.expand(options.logExpand)
    if ([COLLAPSE, EXPAND, true].includes(options.log as any)) {
      consoleGroup.log('Created Svelte component')
    }
  })

  // Re-bind on prop change (after the initial bind in onMount).
  // The first reactive run also fires, so guard with a sentinel.
  let initialReactiveRun = true
  $: {
    void [
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
    ]
    if (initialReactiveRun) {
      initialReactiveRun = false
    } else if (iframe) {
      connectResizer(buildOptions())(iframe)
    }
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
