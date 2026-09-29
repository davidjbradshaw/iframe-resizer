import { test } from './shared/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/angular/index.html'

test.describe('Angular', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
})
