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

  onMount(() => {
    const consoleGroup = createAutoConsoleGroup()

    const props: Record<string, any> = {
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

    const options: Record<string, any> = {
      ...Object.fromEntries(
        Object.entries(props).filter(([, value]) => value !== undefined),
      ),
      waitForLoad: true,

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

    consoleGroup.label(`svelte(${iframe.id})`)
    consoleGroup.event('setup')

    resizer = connectResizer(options)(iframe)

    consoleGroup.expand(options.logExpand)
    if ([COLLAPSE, EXPAND, true].includes(options.log as any)) {
      consoleGroup.log('Created Svelte component')
    }
  })

  onDestroy(() => {
    resizer?.disconnect()
  })

  export function moveToAnchor(anchor: string) {
    resizer?.moveToAnchor(anchor)
  }

  export function sendMessage(msg: any, target?: string) {
    resizer?.sendMessage(msg, target)
  }
</script>

<iframe bind:this={iframe} {...$$restProps}></iframe>
