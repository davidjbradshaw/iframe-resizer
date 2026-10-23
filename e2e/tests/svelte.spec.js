import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/svelte/index.html'
const EARLY_UPDATE = '/e2e/fixtures/svelte/early-update.html'

test.describe('Svelte', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)
})
