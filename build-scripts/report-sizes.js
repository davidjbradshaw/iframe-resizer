import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const kB = (bytes) => `${(bytes / 1024).toFixed(2)} kB`

function measure(path) {
  const source = readFileSync(path)

  return {
    raw: source.length,
    gzip: gzipSync(source).length,
    brotli: brotliCompressSync(source).length,
  }
}

const isEsm = (file) => file.endsWith('.esm.js')

// Where a package ships several formats, only report the ESM build
function listBundles(root, dir) {
  try {
    const files = readdirSync(join(root, dir)).filter(
      (file) => file.endsWith('.js') || file.endsWith('.astro'),
    )
    const bundles = files.some(isEsm) ? files.filter(isEsm) : files

    return bundles.map((file) => `${dir}/${file}`)
  } catch {
    return []
  }
}

// Print one table of every JS bundle in the given dirs (relative to root)
export default function reportSizes(root, dirs, note = '') {
  const rows = dirs
    .flatMap((dir) => listBundles(root, dir))
    .map((path) => ({ path, ...measure(join(root, path)) }))

  if (rows.length === 0) return

  const width = Math.max(...rows.map(({ path }) => path.length))

  console.log(`\n📦 Bundle sizes${note ? ` (${note})` : ''}\n`)

  for (const { path, raw, gzip, brotli } of rows) {
    console.log(
      `  ${path.padEnd(width)}  ${kB(raw).padStart(9)} │ gzip: ${kB(gzip).padStart(8)} │ brotli: ${kB(brotli).padStart(8)}`,
    )
  }
}
