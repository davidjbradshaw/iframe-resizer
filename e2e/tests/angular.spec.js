import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/angular/index.html'

test.describe('Angular', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
