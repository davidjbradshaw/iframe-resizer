import { test } from '@playwright/test'

import { childTests, parentEventTests, parentMethodTests } from './shared'

const BASE = '/e2e/fixtures/angular/index.html'

// TODO: Angular e2e app needs @analogjs/vite-plugin-angular setup
test.describe.skip('Angular', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)
})
