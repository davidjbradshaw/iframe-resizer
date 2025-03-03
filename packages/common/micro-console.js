import { NORMAL } from './consts'
import { time } from './utils'

export default function (newId) {
  let id = newId
  let logging = true
  let logQueue = []

  function logGroup() {
    /* eslint-disable no-console */
    console.group(`[iframe-resizer][${id}] %c${time()}`, NORMAL)
    logQueue.forEach(([type, ...msg]) => console[type](...msg))
    logQueue = []
    console.groupEnd()
    /* eslint-enable no-console */
  }

  const push =
    (type) =>
    (...msg) => {
      if (!logging) return
      if (logQueue.length === 0) queueMicrotask(logGroup)
      logQueue.push([type, ...msg])
    }

  return {
    setId(newId) {
      id = newId
    },
    setLogging(newLogging) {
      logging = newLogging
    },
    log: push('log'),
    info: push('info'),
    warn: push('warn'),
    error: push('error'),
  }
}
