import { jest } from '@jest/globals'
import $ from 'jquery'

global.$ = $
global.jQuery = $

jest.mock('auto-console-group', () => ({
  createGroupConsole: () => console,
}))
