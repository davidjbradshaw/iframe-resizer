import { BOLD } from '../common/consts'
import { round } from '../common/utils'
import { advise, log } from './console'

const SECOND = 1000
const PERF_CHECK_INTERVAL = 5 * SECOND
const THRESHOLD = 4 // ms

export const PREF_START = '--ifr-start'
export const PREF_END = '--ifr-end'
const PREF_MEASURE = '--ifr-measure'

const timings = []
const usedTags = new WeakSet()

const addUsedTag = (el) => typeof el === 'object' && usedTags.add(el)

let detail = {}
let oldAverage = 0

const timingCheck = setInterval(() => {
  if (timings.length < 10) return
  if (detail.hasTags && detail.len < 25) return

  timings.sort()

  const average = Math.min(
    timings.reduce((a, b) => a + b, 0) / timings.length,
    timings[Math.floor(timings.length / 2)],
  )

  const roundedAverage = round(average)

  if (roundedAverage > oldAverage) {
    oldAverage = roundedAverage
    log('%cPage size calculation timings:', BOLD)
    log('  Mean time:', round(timings[Math.floor(timings.length / 2)]))
    log(
      '  Median time:',
      round(timings.reduce((a, b) => a + b, 0) / timings.length),
    )
    log('  Average time:', roundedAverage)
    log('  Max time:', round(Math.max(...timings)))
    // debug('Timings:', JSON.parse(JSON.stringify(timings.map(round))))
  }

  if (average <= THRESHOLD) return

  clearInterval(timingCheck)

  advise(
    `<rb>Performance Warning</>

Calculating the page size is taking an excessive amount of time (${round(average)}ms).

To improve performance add the <b>data-iframe-size</> attribute to the ${detail.Side.toLowerCase()} most element on the page. For more details see: <u>https://iframe-resizer.com/perf</>.`,
  )
}, PERF_CHECK_INTERVAL)

function perfObserver(list) {
  list.getEntries().forEach((entry) => {
    if (entry.name === PREF_END) {
      const { duration } = performance.measure(
        PREF_MEASURE,
        PREF_START,
        PREF_END,
      )
      detail = entry.detail
      timings.push(duration)
      if (timings.length > 100) timings.shift()
    }
  })
}

function setup() {
  // debug('Setup performanceObserver')
  const observer = new PerformanceObserver(perfObserver)
  observer.observe({ entryTypes: ['mark'] })

  addUsedTag(document.documentElement)
  addUsedTag(document.body)
}

if (
  // Guard against everything, as we don't control where and when we are loaded
  typeof document !== 'undefined' &&
  typeof PerformanceObserver !== 'undefined'
) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup)
  } else {
    setup()
  }
}
