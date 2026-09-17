import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/astro/index.html'

test.describe('Astro', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
