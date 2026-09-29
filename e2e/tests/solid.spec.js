import { childTests, parentEventTests, parentMethodTests } from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/solid/index.html'

test.describe('Solid', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
})
