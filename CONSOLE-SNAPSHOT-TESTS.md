# Console Snapshot Testing - Implementation Summary

## What Was Created

A comprehensive end-to-end test system that captures and validates console log output from iframe-resizer across both dev and prod builds.

## Files Created/Modified

### New Files

1. **`e2e/console-snapshot.spec.js`** - Main test file
   - Runs the complete user interaction workflow
   - Captures console logs from both builds
   - Creates snapshots for comparison

2. **`e2e/console-snapshot.README.md`** - Comprehensive documentation
   - How the test works
   - Running instructions
   - Troubleshooting guide
   - Maintenance procedures

3. **`CONSOLE-SNAPSHOT-TESTS.md`** - This summary

### Modified Files

1. **`playwright.config.js`** - Added two new test projects:
   - `console-dev` - Tests with dev build (requires `npm run build:dev` first)
   - `console-prod` - Tests with prod build (requires `npm run vite:prod` first)

2. **`package.json`** - Added npm scripts:
   - `npm run test:e2e:console` - Run both dev and prod snapshot tests
   - `npm run test:e2e:console:update` - Update snapshots after intentional changes

## How to Use

### Initial Setup (First Time)

**Important:** Build and test each version separately to prevent builds from overwriting each other.

1. **Create dev snapshot:**
   ```bash
   npm run build:dev    # Creates js/ directory with debug build
   npx playwright test console-snapshot --project=console-dev --update-snapshots
   ```

2. **Create prod snapshot:**
   ```bash
   npm run vite:prod    # Rebuilds js/ with production build
   npx playwright test console-snapshot --project=console-prod --update-snapshots
   ```

   This will create:
   - `e2e/console-snapshot.spec.js-snapshots/console-logs-console-dev-darwin.txt`
   - `e2e/console-snapshot.spec.js-snapshots/console-logs-console-prod-darwin.txt`

   Note: Playwright stores text snapshots in a directory named after the test file and automatically appends the project name and platform to the snapshot filename. The platform suffix may differ on your machine (e.g., `-linux` or `-windows` instead of `-darwin`).

3. **Review and commit snapshots:**
   ```bash
   git add e2e/*-snapshots/
   git commit -m "Add console snapshot baselines"
   ```

### Regular Use

**Run tests for both builds:**

You need to run each build separately:

```bash
# Test dev build
npm run build:dev
npx playwright test console-snapshot --project=console-dev

# Test prod build
npm run vite:prod
npx playwright test console-snapshot --project=console-prod
```

Each test will:
- ✅ Run the full interaction workflow
- ✅ Capture all iframe-resizer console logs
- ✅ Compare against saved snapshots
- ✅ Fail if output doesn't match

**Update snapshots (when logging changes intentionally):**

Update each build separately:

```bash
# Update dev snapshot
npm run build:dev
npx playwright test console-snapshot --project=console-dev --update-snapshots

# Update prod snapshot
npm run vite:prod
npx playwright test console-snapshot --project=console-prod --update-snapshots

# Commit updated snapshots
git add e2e/*-snapshots/
git commit -m "Update console snapshots"
```

### Test Workflow

The test executes these steps on `/example-test/html/index.html`:

1. ✅ Open modal → Close modal
2. ✅ Toggle content
3. ✅ Mutate text node
4. ✅ Insert overflow
5. ✅ autoResize(false)
6. ✅ Remove overflow
7. ✅ autoResize(true)
8. ✅ Insert content
9. ✅ Absolute Position
10. ✅ Jump to iFrame anchor
11. ✅ Scroll to top
12. ✅ Scroll to iFrame
13. ✅ scrollBy(50)
14. ✅ Jump to parent anchor
15. ✅ Navigate to Overflow
16. ✅ Toggle ignore (×2)
17. ✅ Back to page 1
18. ✅ Nested (×4)
19. ✅ Send Message (with alert dialogs)
20. ✅ Toggle content
21. ✅ Two iframes page
22. ✅ Nested in frame 1
23. ✅ Toggle content in frame 2
24. ✅ Single iframe
25. ✅ TextArea + resize
26. ✅ Back to page 1
27. ✅ 404 page

## What Gets Captured

The test captures console logs containing:
- `[iframe-resizer` - Framework logs
- `iframeResizer` - API logs

**Normalization** (to prevent false positives):
- Memory addresses: `@0x123456` → `@0xXXXXXX`
- Timestamps: `123ms` → `XXXms`
- File paths: Full path → `file:///PATH`
- Line numbers: `:123:45` → `:XX:XX`

## When Tests Fail

### ✅ Expected (Update Snapshots)

Update snapshots when you:
- Add new features with logging
- Improve log messages
- Change log formatting
- Modify debug behavior

### ❌ Unexpected (Investigate)

Investigate when:
- No code changes but snapshots differ
- Dev and prod outputs diverge
- Logs disappear
- Error messages appear
- Performance changes significantly

## CI Integration

### GitHub Actions

A dedicated workflow runs console snapshot tests on every push and PR:

**Workflow:** `.github/workflows/console-snapshot.yml`

**What it does:**
1. ✅ Builds both dev (`npm run build:dev`) and prod (`npm run vite:prod`) versions
2. ✅ Runs console snapshot tests against both builds
3. ✅ Compares output against committed snapshots
4. ✅ Fails the build if snapshots don't match
5. ✅ Uploads test reports and diffs as artifacts
6. ✅ Comments on PRs with instructions if snapshots fail

**When it runs:**
- Every push to `master` or `dev` branches
- Every pull request to `master` or `dev` branches

**On failure:**
- Build fails, preventing merge
- Artifacts contain detailed diff reports
- PR comment explains how to update snapshots

**Viewing results:**
1. Go to PR → Checks → "Console Snapshot Tests"
2. Download "console-snapshot-diffs" artifact
3. Review actual vs expected snapshot differences

### Updating Snapshots in CI

When logging changes are intentional:

1. **Locally update snapshots:**
   ```bash
   npm run test:e2e:console:update
   ```

2. **Commit the updated snapshots:**
   ```bash
   git add e2e/*-snapshots/
   git commit -m "Update console snapshots for [feature/fix]"
   git push
   ```

3. **CI will pass** with the new snapshots committed

## Debugging Failed Tests

1. **View HTML report:**
   ```bash
   npx playwright show-report
   ```

2. **Run with headed browser:**
   ```bash
   npx playwright test console-snapshot --project=console-dev --headed
   ```

3. **Check actual vs expected:**
   - Failed snapshots saved to `test-results/`
   - Compare `-actual.txt` vs `-expected.txt`

4. **Run only one build:**
   ```bash
   # Debug dev build only
   npx playwright test console-snapshot --project=console-dev --debug

   # Debug prod build only
   npx playwright test console-snapshot --project=console-prod --debug
   ```

## Maintenance

### Adding New Test Steps

1. Edit `e2e/console-snapshot.spec.js`
2. Add new `await test.step('Step name', async () => { ... })`
3. Run `npm run test:e2e:console:update`
4. Review diff in snapshots
5. Commit updated snapshots

### Modifying Existing Steps

1. Update step logic in spec file
2. Run test to see if snapshots match
3. If intentional change, update snapshots
4. Review diff for unintended side effects

## Benefits

1. **Regression Detection**: Catches unintended logging changes
2. **Documentation**: Snapshots serve as documentation of expected behavior
3. **Build Verification**: Ensures dev and prod builds behave consistently
4. **Debugging Aid**: Diffs show exactly what changed
5. **Confidence**: Safe refactoring with snapshot validation

## Technical Details

- **Test Framework**: Playwright
- **Snapshot Location**: `e2e/console-snapshot.spec.js-snapshots/`
- **Build Testing**: Each project runs against js/ after the appropriate build
- **Projects**: `console-dev` and `console-prod` in `playwright.config.js`
- **Page Under Test**: `/example-test/html/index.html`

## Next Steps

1. Run initial snapshot creation
2. Review generated snapshots
3. Commit snapshots to git
4. Tests will run automatically on CI
5. Update snapshots when logging intentionally changes

For detailed information, see `e2e/console-snapshot.README.md`.
