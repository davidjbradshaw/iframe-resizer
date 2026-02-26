import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { rollup } from 'rollup'
import clear from 'rollup-plugin-clear'

import {
  createBanner,
  injectVersion,
  pluginsBase,
  typescriptChild,
  typescriptParent,
} from '../vite.config/shared/plugins.js'

const { BETA, DEBUG } = process.env
const sourcemap = DEBUG || BETA || false
const stripLog = !(DEBUG || BETA)

const configs = [
  {
    input: 'packages/parent/iife.ts',
    output: {
      banner: createBanner('parent', 'iife'),
      file: 'js/iframe-resizer.parent.js',
      format: 'iife',
      name: 'iframeResize',
      sourcemap,
      plugins: DEBUG
        ? []
        : [
            terser({
              output: {
                comments: false,
                preamble: createBanner('parent', 'iife'),
              },
            }),
          ],
    },
    plugins: [
      typescriptParent(),
      clear({ targets: ['js'] }),
      resolve(),
      ...pluginsBase(stripLog)(),
      ...injectVersion(),
    ],
  },
  {
    input: 'packages/child/index.ts',
    output: {
      banner: createBanner('child', 'iife'),
      file: 'js/iframe-resizer.child.js',
      format: 'iife',
      sourcemap,
      plugins: DEBUG
        ? []
        : [
            terser({
              output: {
                comments: false,
                preamble: createBanner('child', 'iife'),
              },
            }),
          ],
    },
    plugins: [
      typescriptChild(),
      resolve(),
      ...pluginsBase(stripLog)(),
      ...injectVersion(),
    ],
  },
  {
    input: 'packages/jquery/plugin.js',
    output: {
      banner: createBanner('jquery', 'iife'),
      file: 'js/iframe-resizer.jquery.js',
      format: 'iife',
      sourcemap,
      plugins: DEBUG
        ? []
        : [
            terser({
              output: {
                comments: false,
                preamble: createBanner('jquery', 'iife'),
              },
            }),
          ],
    },
    plugins: [
      typescriptParent(),
      resolve(),
      ...pluginsBase(stripLog)(),
      ...injectVersion(),
    ],
  },
]

export default async function buildBrowser() {
  for (const config of configs) {
    const bundle = await rollup(config)
    await bundle.write(config.output)
    await bundle.close()
  }
}
