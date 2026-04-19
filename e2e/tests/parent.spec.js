import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/index.html'

test.describe('Parent (vanilla)', () => {
  parentEventTests(BASE, { blocksClose: false })
  parentMethodTests(BASE)
  childTests(BASE)
})
