import { describe, expect, test } from 'vitest'

import readFromParent from './from-parent'

describe('child/read/from-parent', () => {
  test('maps indices with casting to booleans and numbers', () => {
    const data = []
    data[0] = 'parent-id'
    data[1] = '10' // bodyMargin -> Number
    data[2] = 'true' // calculateWidth -> Boolean
    data[3] = 'false' // logging -> Boolean
    // 4 skipped
    data[6] = 'true' // autoResize
    data[7] = '2px' // bodyMarginStr
    data[8] = 'auto'
    data[9] = '#fff'
    data[10] = '1rem'
    data[11] = '3' // tolerance -> Number
    data[12] = 'true' // inPageLinks
    // 13 skipped
    data[14] = 'scroll' // widthCalcMode
    data[15] = 'false' // mouseEvents
    data[16] = '5' // offsetHeight
    data[17] = '7' // offsetWidth
    data[18] = 'true' // calculateHeight
    data[19] = 'key'
    data[20] = '5.0.0'
    data[21] = '0' // mode -> Number
    data[23] = 'true' // logExpand -> Boolean

    const out = readFromParent(data)

    expect(out.parentId).toBe('parent-id')
    expect(out.bodyMargin).toBe(10)
    expect(out.calculateWidth).toBe(true)
    expect(out.logging).toBe(false)
    expect(out.autoResize).toBe(true)
    expect(out.bodyMarginStr).toBe('2px')
    expect(out.heightCalcMode).toBe('auto')
    expect(out.tolerance).toBe(3)
    expect(out.inPageLinks).toBe(true)
    expect(out.widthCalcMode).toBe('scroll')
    expect(out.mouseEvents).toBe(false)
    expect(out.offsetHeight).toBe(5)
    expect(out.offsetWidth).toBe(7)
    expect(out.calculateHeight).toBe(true)
    expect(out.key).toBe('key')
    expect(out.version).toBe('5.0.0')
    expect(out.mode).toBe(0)
    expect(out.logExpand).toBe(true)
  })

  test('handles undefined values gracefully', () => {
    const data = []
    data[0] = 'test-id'
    // Leave other values undefined

    const out = readFromParent(data)

    expect(out.parentId).toBe('test-id')
    expect(out.bodyMargin).toBeUndefined()
    expect(out.calculateWidth).toBeUndefined()
    expect(out.logging).toBeUndefined()
    expect(out.tolerance).toBeUndefined()
    expect(out.mode).toBeUndefined()
  })
})
