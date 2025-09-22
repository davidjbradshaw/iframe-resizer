import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'

export default function visibilityObserver(callback) {
  const observer = new IntersectionObserver(
    (entries) => callback(entries[0].isIntersecting),
    {
      threshold: 0,
    },
  )

  const target = document.documentElement
  observer.observe(target)

  info('Attached%c VisibilityObserver%c to page', HIGHLIGHT, FOREGROUND)

  return {
    disconnect: () => {
      observer.disconnect()
      info('Detached%c VisibilityObserver', HIGHLIGHT)
    },
  }
}
