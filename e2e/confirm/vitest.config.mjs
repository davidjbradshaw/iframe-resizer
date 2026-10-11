import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import base from '../../vitest.config.mjs'

const here = dirname(fileURLToPath(import.meta.url))

// Runs the unit confirmation tests in this folder, which the normal run never sees
export default {
  ...base,
  root: join(here, '../..'),
  test: {
    ...base.test,
    include: ['e2e/confirm/**/*.test.{js,ts,jsx,tsx}'],
    exclude: ['node_modules/**', 'dist/**'],
    coverage: { enabled: false },
  },
}
