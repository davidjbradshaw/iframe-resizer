import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import { test } from './shared/test'

const BASE = '/e2e/fixtures/alpine/index.html'
const EARLY_UPDATE = '/e2e/fixtures/alpine/early-update.html'

test.describe('Alpine', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)
})
