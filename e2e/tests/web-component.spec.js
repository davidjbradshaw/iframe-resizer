import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/web-component/index.html'

test.describe('Web Component', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
