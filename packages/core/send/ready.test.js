// Mocks must be declared before imports
import { INIT_FROM_IFRAME } from '../../common/consts'
import settings from '../values/settings'
import createOutgoingMessage from './outgoing'
import ready, { sendInit } from './ready'
import warnOnNoResponse from './timeout'
import trigger from './trigger'

jest.mock('../values/settings', () => ({
  __esModule: true,
  default: {},
}))

jest.mock('../../common/consts', () => ({
  __esModule: true,
  INIT_FROM_IFRAME: 'init-from-iframe',
}))

jest.mock('./outgoing', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./timeout', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./trigger', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('core/ready', () => {
  beforeEach(() => {
    for (const k of Object.keys(settings)) delete settings[k]
    jest.clearAllMocks()
  })

  describe('sendInit', () => {
    test('triggers init and warns when source matches and not ready', () => {
      const iframeId = 'abc'
      const source = {}
      settings[iframeId] = {
        ready: false,
        postMessageTarget: source,
      }
      createOutgoingMessage.mockReturnValue('payload-abc')

      sendInit(source)(iframeId)

      expect(createOutgoingMessage).toHaveBeenCalledWith(iframeId)
      expect(trigger).toHaveBeenCalledWith(
        INIT_FROM_IFRAME,
        'payload-abc',
        iframeId,
      )

      expect(warnOnNoResponse).toHaveBeenCalledWith(iframeId, settings)
    })

    test('does nothing if already ready', () => {
      const iframeId = 'def'
      const source = {}
      settings[iframeId] = {
        ready: true,
        postMessageTarget: source,
      }

      sendInit(source)(iframeId)

      expect(createOutgoingMessage).not.toHaveBeenCalled()
      expect(trigger).not.toHaveBeenCalled()
      expect(warnOnNoResponse).not.toHaveBeenCalled()
    })

    test('does nothing if source does not match postMessageTarget', () => {
      const iframeId = 'ghi'
      const source = {}
      settings[iframeId] = {
        ready: false,
        postMessageTarget: {},
      }

      sendInit(source)(iframeId)

      expect(createOutgoingMessage).not.toHaveBeenCalled()
      expect(trigger).not.toHaveBeenCalled()
      expect(warnOnNoResponse).not.toHaveBeenCalled()
    })
  })

  describe('default export (batch over settings)', () => {
    test('iterates all settings and triggers only matching, not-ready entries', () => {
      const src = {}
      settings.a = { ready: false, postMessageTarget: src }
      settings.b = { ready: true, postMessageTarget: src } // ready -> skip
      settings.c = { ready: false, postMessageTarget: {} } // source mismatch -> skip

      createOutgoingMessage.mockReturnValueOnce('payload-a')

      ready(src)

      expect(createOutgoingMessage).toHaveBeenCalledTimes(1)
      expect(createOutgoingMessage).toHaveBeenCalledWith('a')

      expect(trigger).toHaveBeenCalledTimes(1)
      expect(trigger).toHaveBeenCalledWith('init-from-iframe', 'payload-a', 'a')

      expect(warnOnNoResponse).toHaveBeenCalledTimes(1)
      expect(warnOnNoResponse).toHaveBeenCalledWith('a', settings)
    })
  })
})
