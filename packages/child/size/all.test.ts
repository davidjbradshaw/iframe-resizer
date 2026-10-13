import { describe, expect, test } from 'vitest'

import { getAllElements } from './all'

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
})
