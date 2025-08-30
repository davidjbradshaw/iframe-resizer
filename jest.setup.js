// import { jest } from '@jest/globals'
import $ from 'jquery'

global.$ = $
global.jQuery = $

// jest.mock('auto-console-group', () => {
//   // Default export: factory returning a console-group-like API (no-ops)
//   const create = () => new Proxy({}, { get: () => () => {} })

//   // Named export used by your code
//   const NORMAL = 'font-weight: normal;'

//   // ESM-compatible mock (default + named)
//   return { __esModule: true, default: create, NORMAL }
// })
