# GitHub Copilot Instructions

## Before every commit/check-in

**Always run `npm run eslint:fix` before committing any changes.**

This is mandatory — failure to run `eslint:fix` will cause CI to fail with ESLint formatting and style errors.

```bash
npm run eslint:fix    # Lint and auto-fix all issues
npm run eslint        # Lint only (to verify)
```

See `CLAUDE.md` for full project guidance.
