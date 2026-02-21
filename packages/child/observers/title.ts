import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'

const config: MutationObserverInit = {
  characterData: true,
  childList: true,
  subtree: true,
}

export default function createTitleObserver(callback: () => void): { disconnect: () => void } {
  const target = document.head ?? document.documentElement
  const observer = new MutationObserver(callback)

  observer.observe(target, config)
  callback()

  info('Attached%c TitleObserver%c to head', HIGHLIGHT, FOREGROUND)

  return {
    disconnect: () => {
      observer.disconnect()
      info('Detached%c TitleObserver', HIGHLIGHT)
    },
  }
}
