import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import base from '../../playwright.config.js'

const here = dirname(fileURLToPath(import.meta.url))

// Runs the confirmation specs in this folder, which the normal run never sees
export default {
  ...base,
  testDir: here,
  reporter: 'line',
  retries: 0,
  webServer: {
    ...base.webServer,
    cwd: join(here, '../..'),
    reuseExistingServer: true,
  },
}
