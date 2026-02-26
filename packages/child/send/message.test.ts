/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('../console', () => ({
  endAutoGroup: vi.fn(),
  errorBoundary: (fn) => fn,
  event: vi.fn(),
}))

vi.mock('./dispatch', () => ({ default: vi.fn() }))

// Import after mocks
import sendMessage from './message'
import * as childConsole from '../console'
import mockedDispatch from './dispatch'

describe('child/send/message', () => {
  it('logs event, dispatches message and ends group', () => {
    sendMessage(100, 200, 'MANUAL', { foo: 'bar' }, '*')

    expect(childConsole.event).toHaveBeenCalledWith('MANUAL')
    expect(mockedDispatch).toHaveBeenCalledWith(
      100,
      200,
      'MANUAL',
      { foo: 'bar' },
      '*',
    )
    expect(childConsole.endAutoGroup).toHaveBeenCalledTimes(1)
  })
})
