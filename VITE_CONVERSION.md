# Rollup to Vite Conversion (Using Vite Plugins with Rollup)

This document explains the conversion of the iframe-resizer project build system to use Vite plugins while maintaining Rollup for the build process.

## What Changed

### Build Configuration
- **Old**: `rollup.config.mjs` with Rollup CLI
- **New**: `vite.config.js` with custom build script (`vite-build.js`)

### Vue Plugin
- **Old**: `rollup-plugin-vue`
- **New**: `@vitejs/plugin-vue`

### Build Scripts
All build scripts in `package.json` now use the `vite:*` prefix instead of `rollup:*`:
- `npm run vite:prod` - Production build
- `npm run vite:debug` - Development build
- `npm run vite:beta` - Beta build
- `npm run vite:test` - Test build
- `npm run vite:watch` - Watch mode

## Technical Details

### Why the Custom Build Script?

Vite is primarily designed for application builds with specific conventions that don't match the requirements of this multi-package library build system. The project needs to:
- Build multiple packages simultaneously
- Support multiple output formats (UMD, ESM, CJS, IIFE)
- Generate outputs to different directories (`dist/` and `js/`)
- Use custom Rollup plugins for package generation, file copying, and more

The solution uses:
1. **vite.config.js**: Contains the build configuration (same structure as the original Rollup config)
2. **vite-build.js**: A Node script that uses Rollup programmatically to execute the build configurations
3. **Vite plugins**: Leverages modern Vite plugins like `@vitejs/plugin-vue` for better Vue 3 support

### Relationship Between Vite and Rollup

Vite uses Rollup under the hood for production builds. This conversion:
- ✅ Uses Vite's Vue plugin for improved Vue 3 compatibility
- ✅ Maintains the same build output and structure
- ✅ Preserves all existing Rollup plugins and configurations
- ✅ Provides a path for future Vite features and optimizations

## Build Output

The build generates the same output structure as before:
- **dist/**: NPM packages with multiple formats (UMD, ESM, CJS)
- **js/**: Browser-ready IIFE bundles
- **test-js/**: Test builds (when TEST=1)

## Verification

All builds work identically to the Rollup version:
```bash
# Development build (js/ folder only)
npm run build:dev

# Production build (dist/ and js/ folders)
npm run build:prod

# Run tests
npm test
```

## Benefits of the Conversion

1. **Modern tooling**: Uses Vite's plugin ecosystem
2. **Better Vue support**: `@vitejs/plugin-vue` has better Vue 3 support
3. **Future-proof**: Positioned to leverage future Vite features
4. **Maintained compatibility**: All existing features and outputs work exactly as before
