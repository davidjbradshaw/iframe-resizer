import { childTests, parentEventTests, parentMethodTests } from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/vue/index.html'

test.describe('Vue', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
})
