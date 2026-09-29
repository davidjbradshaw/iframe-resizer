import { childTests, parentEventTests, parentMethodTests } from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/astro/index.html'

test.describe('Astro', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
