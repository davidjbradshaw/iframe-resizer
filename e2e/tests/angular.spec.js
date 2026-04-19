import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/angular/index.html'

// TODO: Angular e2e app build needs fixing - @analogjs/vite-plugin-angular
// not rendering components correctly. Tracked separately.
test.describe.skip('Angular', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
