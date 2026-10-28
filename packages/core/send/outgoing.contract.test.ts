import {
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
} from '@iframe-resizer/common/consts'
import { describe, expect, test, vi } from 'vitest'

// Each field has a value nothing else in the message shares, so a field that
// arrives in the wrong place shows up as a wrong value rather than passing
vi.mock('../values/page', () => ({ default: { version: '6.1.2' } }))
vi.mock('../values/settings', () => ({
  default: {
    contract: {
      autoResize: true,
      bodyBackground: 'url(https://cdn.example/bg.png)',
      bodyMargin: '12px',
      bodyPadding: 'calc(10px:5px)',
      heightCalculationMethod: 'taggedElement',
      inPageLinks: false,
      license: 'GPLv3',
      log: true,
      logExpand: false,
      mouseEvents: true,
      offsetHeight: 21,
      offsetWidth: 22,
      mode: 3,
      sizeHeight: true,
      sizeWidth: false,
      tolerance: 7,
      widthCalculationMethod: 'scroll',
      maxContentWidth: true,
      bindId: 'k3x9',
    },
    // An id of the shape React's useId() produces
    ':r1:': {
      bodyBackground: 'url(https://cdn.example/bg.png)',
      bodyPadding: 'calc(10px:5px)',
      mode: 3,
      sizeHeight: true,
      sizeWidth: false,
    },
  },
}))

const createOutgoingMessage = (await import('./outgoing')).default
const readDataFromParent = (await import('../../child/read/from-parent'))
  .default

// What the child does with an init message, from received/init.ts
const fieldsFor = (id: string): string[] =>
  (MESSAGE_ID + createOutgoingMessage(id))
    .slice(MESSAGE_ID_LENGTH)
    .split(SEPARATOR)

// core/send/outgoing.ts writes the init message by position and
// child/read/from-parent.ts reads it by position. Each has its own unit test
// pinning its own side against a hand written message, which leaves the one
// thing that matters untested: that the two are the same map. This runs the
// parent's output straight into the child's reader, so a field added,
// removed or moved on either side fails here.
describe('init message contract between core and child', () => {
  test('every field the parent writes is the field the child reads', () => {
    const parsed = readDataFromParent(fieldsFor('contract'))

    expect(parsed).toEqual({
      parentId: 'contract',
      bodyMargin: 8, // field 1, the v1 padding constant
      calculateWidth: false, // field 2 <- sizeWidth
      logging: true, // field 3 <- log
      autoResize: true, // field 6
      bodyMarginStr: '12px', // field 7 <- bodyMargin
      bodyBackground: 'url(https://cdn.example/bg.png)', // field 9, unescaped
      bodyPadding: 'calc(10px:5px)', // field 10, unescaped
      tolerance: 7, // field 11
      inPageLinks: false, // field 12
      mouseEvents: true, // field 15
      offsetHeight: 21, // field 16
      offsetWidth: 22, // field 17
      calculateHeight: true, // field 18 <- sizeHeight
      key: 'GPLv3', // field 19 <- license
      version: '6.1.2', // field 20
      mode: 3, // field 21
      logExpand: false, // field 23
      maxContentWidth: true, // field 24
      bindId: 'k3x9', // field 25
    })
  })

  // A v1-v5 child reads up to field 20 and ignores the rest, so a new field
  // may only be appended. Inserting one shifts every field after it and
  // breaks those children, which this length check catches.
  test('the message is 26 fields, with the legacy ones first', () => {
    const fields = fieldsFor('contract')

    expect(fields).toHaveLength(26)
    expect(fields.slice(0, 21)).toEqual([
      'contract', // 0  id
      '8', // 1  v1 bodyPadding
      'false', // 2  sizeWidth
      'true', // 3  log
      '32', // 4  v1 interval
      'true', // 5  v1 publicMethods
      'true', // 6  autoResize
      '12px', // 7  bodyMargin
      'taggedElement', // 8  heightCalculationMethod
      'url(https%3A//cdn.example/bg.png)', // 9  bodyBackground
      'calc(10px%3A5px)', // 10 bodyPadding
      '7', // 11 tolerance
      'false', // 12 inPageLinks
      'child', // 13 resizeFrom
      'scroll', // 14 widthCalculationMethod
      'true', // 15 mouseEvents
      '21', // 16 offsetHeight
      '22', // 17 offsetWidth
      'true', // 18 sizeHeight
      'GPLv3', // 19 license
      '6.1.2', // 20 version
    ])
  })

  // The id and body styles are free text; a colon in one must survive the
  // round trip rather than shift the fields after it
  test('the child gets back the colons the parent escaped', () => {
    const parsed = readDataFromParent(fieldsFor(':r1:'))

    expect(parsed.parentId).toBe(':r1:')
    expect(parsed.bodyPadding).toBe('calc(10px:5px)')
    expect(parsed.bodyBackground).toBe('url(https://cdn.example/bg.png)')
  })
})
