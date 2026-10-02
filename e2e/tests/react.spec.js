import { childTests, parentEventTests, parentMethodTests } from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/react/index.html'

test.describe('React', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
})
