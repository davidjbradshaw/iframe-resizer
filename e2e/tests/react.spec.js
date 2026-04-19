import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/react/index.html'

test.describe('React', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
