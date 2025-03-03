import { NORMAL } from './consts'
import { time } from './utils'

export default function () {
  let id = 'child'
  let logging = false
  let logQueue = []

  function logGroup() {
    /* eslint-disable no-console */
    console.group(`[iframe-resizer][${id}] %c${time()}`, NORMAL)
    logQueue.forEach(([type, ...msg]) => console[type](...msg))
    logQueue = []
    console.groupEnd()
    /* eslint-enable no-console */
  }

  return {
    setId(newId) {
      id = newId
    },
    setLogging(newLogging) {
      logging = newLogging
    },
    add(type, ...msg) {
      if (!logging) return
      if (logQueue.length === 0) queueMicrotask(logGroup)
      logQueue.push([type, ...msg])
    },
  }
}
