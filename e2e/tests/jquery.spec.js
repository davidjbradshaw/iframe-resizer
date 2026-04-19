import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/jquery.html'

test.describe('jQuery', () => {
  parentEventTests(BASE, { blocksClose: false })
  parentMethodTests(BASE)
  childTests(BASE)
})
