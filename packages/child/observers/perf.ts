import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { round } from '../../common/utils'
import { advise, event, info, log } from '../console'

const SECOND = 1000
const PERF_CHECK_INTERVAL = 5 * SECOND
const THRESHOLD = 4 // ms
const MIN_SAMPLES = 10
const MAX_SAMPLES = 100

export const PREF_START = '--ifr-start'
export const PREF_END = '--ifr-end'
const PREF_MEASURE = '--ifr-measure'

const timings: number[] = []

let detail: any = {}
let oldAverage = 0
let timingCheckId: ReturnType<typeof setInterval>

function clearPerfMarks(): void {
  try {
    performance.clearMarks(PREF_START)
    performance.clearMarks(PREF_END)
    performance.clearMeasures(PREF_MEASURE)
  } catch {
    // Ignore errors if marks are not supported
  }
}

function startTimingCheck(): void {
  timingCheckId = setInterval(() => {
    if (timings.length < MIN_SAMPLES) return
    if (detail.hasTags && detail.len < 25) return

    timings.sort()

    const average = Math.min(
      timings.reduce((a, b) => a + b, 0) / timings.length,
      timings[Math.floor(timings.length / 2)],
    )

    const roundedAverage = round(average)

    if (roundedAverage > oldAverage) {
      oldAverage = roundedAverage
      event('performanceObserver')
      log('Mean time:', round(timings[Math.floor(timings.length / 2)]))
      log(
        'Median time:',
        round(timings.reduce((a, b) => a + b, 0) / timings.length),
      )
      log('Average time:', roundedAverage)
      log('Max time:', round(Math.max(...timings)))
      // debug('Timings:', JSON.parse(JSON.stringify(timings.map(round))))
    }

    clearPerfMarks()

    if (average <= THRESHOLD) return

    clearInterval(timingCheckId)

    advise(
      `<rb>Performance Warning</>

Calculating the page size is taking an excessive amount of time (${round(average)}ms).

To improve performance add the <b>data-iframe-size</> attribute to the ${detail.Side.toLowerCase()} most element on the page. For more details see: <u>https://iframe-resizer.com/perf</>.`,
    )
  }, PERF_CHECK_INTERVAL)
}

function perfObserver(list: PerformanceObserverEntryList): void {
  list.getEntries().forEach((entry) => {
    if (entry.name !== PREF_END) return
    try {
      const { duration } = performance.measure(
        PREF_MEASURE,
        PREF_START,
        PREF_END,
      )
      detail = entry.detail
      timings.push(duration)
      if (timings.length > MAX_SAMPLES) timings.shift()
    } catch {
      // Missing marks; ignore
    }
  })
}

export default function createPerformanceObserver(): { disconnect: () => void } {
  info('Attached%c PerformanceObserver%c to page', HIGHLIGHT, FOREGROUND)
  const observer = new PerformanceObserver(perfObserver)
  observer.observe({ entryTypes: ['mark'] })

  startTimingCheck()

  return {
    disconnect: () => {
      clearPerfMarks()
      clearInterval(timingCheckId)
      observer.disconnect()
      info('Detached%c PerformanceObserver', HIGHLIGHT)
    },
  }
}
