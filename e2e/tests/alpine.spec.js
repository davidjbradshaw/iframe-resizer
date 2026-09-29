import { childTests, parentEventTests, parentMethodTests } from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/alpine/index.html'

test.describe('Alpine', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
})
