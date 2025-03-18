import { jest } from '@jest/globals'
import $ from 'jquery'

global.$ = $
global.jQuery = $

jest.mock('auto-group-console', () => ({
  createGroupConsole: () => console,
}))
