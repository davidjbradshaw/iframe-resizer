import { describe, expect, test } from 'vitest'

import { getAllElements, getAllMeasurements } from './all'

describe('child/size/all', () => {
  test('getAllElements excludes ignored tags', () => {
    document.body.innerHTML = `
      <div id="ok1"></div>
      <span id="ok2"></span>
      <script id="bad"></script>
    `
    const els = getAllElements(document.documentElement)
    const ids = Array.from(els)
      .map((n) => n.id)
      .filter(Boolean)

    expect(ids).toContain('ok1')
    expect(ids).toContain('ok2')
    expect(ids).not.toContain('bad')
  })

  test('getAllMeasurements collects values from dimension impl', () => {
    const dim = {
      bodyOffset: () => 1,
      bodyScroll: () => 2,
      documentElementOffset: () => 3,
      documentElementScroll: () => 4,
      boundingClientRect: () => 5,
    }

    expect(getAllMeasurements(dim)).toEqual([1, 2, 3, 4, 5])
  })
})
