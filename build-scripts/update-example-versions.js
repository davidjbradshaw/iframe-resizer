#!/usr/bin/env node
// Point the public examples at the version of iframe-resizer just published
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

import pkg from '../package.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))
const examples = join(__dirname, '..', 'example')
const range = `^${pkg.version}`

// The registry can take a moment to serve a version just published
const ATTEMPTS = 5
const RETRY_DELAY_MS = 5000

function setVersions(file) {
  const example = JSON.parse(readFileSync(file, 'utf8'))
  let changed = false

  for (const deps of [example.dependencies, example.devDependencies]) {
    for (const name of Object.keys(deps ?? {})) {
      if (name.startsWith('@iframe-resizer/') && deps[name] !== range) {
        deps[name] = range
        changed = true
      }
    }
  }

  if (changed) writeFileSync(file, `${JSON.stringify(example, null, 2)}\n`)
  return changed
}

async function updateLockfile(dir) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      execSync(
        'npm install --package-lock-only --ignore-scripts --no-audit --no-fund',
        { cwd: dir, stdio: 'inherit' },
      )
      return
    } catch (error) {
      if (attempt === ATTEMPTS) throw error
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`)
      await sleep(RETRY_DELAY_MS)
    }
  }
}

for (const name of readdirSync(examples)) {
  const dir = join(examples, name)
  const file = join(dir, 'package.json')
  if (!existsSync(file)) continue

  console.log(`\nexample/${name}`)
  if (setVersions(file)) console.log(`  @iframe-resizer/* -> ${range}`)
  await updateLockfile(dir)
}

console.log(`\nExamples use iframe-resizer ${range}\n`)
