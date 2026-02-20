import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for iframe-resizer e2e tests
 * @see https://playwright.dev/docs/test-configuration
 */

const CONSOLE_SNAPSHOT_TEST = /console-snapshot\.spec\.js/
const DESKTOP_CHROME = devices['Desktop Chrome']

export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
  },

  /* Snapshot paths without OS-specific suffixes for cross-platform compatibility */
  /* Preserves project differentiation (console-dev/console-prod) while removing platform suffixes */
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...DESKTOP_CHROME },
      testIgnore: CONSOLE_SNAPSHOT_TEST,
    },

    // Console snapshot tests - dev build
    // Requires: npm run build:dev (to populate js/ with dev build)
    {
      name: 'console-dev',
      use: { ...DESKTOP_CHROME },
      testMatch: CONSOLE_SNAPSHOT_TEST,
      timeout: 60000, // 60s timeout for comprehensive interaction workflow
    },

    // Console snapshot tests - prod build
    // Requires: npm run vite:prod (to populate js/ with prod build)
    {
      name: 'console-prod',
      use: { ...DESKTOP_CHROME },
      testMatch: CONSOLE_SNAPSHOT_TEST,
      timeout: 60000, // 60s timeout for comprehensive interaction workflow
    },

    // Uncomment to test in Firefox and Safari
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run serve:e2e',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
