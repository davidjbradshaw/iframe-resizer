import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/solid/index.html'
const EARLY_UPDATE = '/e2e/fixtures/solid/early-update.html'

test.describe('Solid', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)
})
