import { advise, info, log } from './log'

const SECOND = 1000
const DEC_PLACES = 100_000 // 5 decimal places
const PERF_CHECK_INTERVAL = 5 * SECOND
const THRESHOLD = 4 // ms

export const PREF_START = '--ifr-start'
export const PREF_END = '--ifr-end'
const PREF_MEASURE = '--ifr-measure'

const timings = []
const usedTags = new WeakSet()

const addUsedTag = (el) => typeof el === 'object' && usedTags.add(el)
const round = (num) => Math.floor(num * DEC_PLACES) / DEC_PLACES

let lastPerfEl = null
let perfEl = null
let details = {}

export const setPerfEl = (el) => {
  perfEl = el
}

function usedEl(detail, duration) {
  // eslint-disable-next-line no-unused-vars
  const { Side, len, hasTags, logging } = detail

  details = detail

  if (usedTags.has(perfEl) || lastPerfEl === perfEl || (hasTags && len <= 1)) {
    return
  }

  if (!logging) addUsedTag(perfEl)

  lastPerfEl = perfEl

  info(
    `\n${Side} position calculated from:\n`,
    perfEl,
    `\nParsed ${len} ${hasTags ? 'tagged' : 'potentially overflowing'} elements in ${round(duration)}ms`,
  )
}

const timingCheck = setInterval(() => {
  if (timings.length < 10) return
  if (details.hasTags && details.len < 25) return

  timings.sort()

  const average = Math.min(
    timings.reduce((a, b) => a + b, 0) / timings.length,
    timings[Math.floor(timings.length / 2)],
  )

  // console.info('Timings:', JSON.parse(JSON.stringify(timings)))
  // console.info('Mean time:', timings[Math.floor(timings.length / 2)])
  // console.info(
  //   'Median time:',
  //   timings.reduce((a, b) => a + b, 0) / timings.length,
  // )
  // console.info('Average time:', round(average), average)

  log('Max time:', Math.max(timings))

  if (average <= THRESHOLD) return

  clearInterval(timingCheck)

  advise(
    `<rb>Performance Warning</>

Calculating the page size is taking an excessive amount of time (${round(average)}ms).

To improve performance add the <b>data-iframe-size</> attribute to the ${details.Side.toLowerCase()} most element on the page. For more details see: <u>https://iframe-resizer.com/perf</>.`,
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
      usedEl(entry.detail, duration)
      timings.push(duration)
      if (timings.length > 100) timings.shift()
    }
  })
}

function setup() {
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
