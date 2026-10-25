// Reruns the build when packages/ or vite.config/ change. Node's own --watch
// mode posts messages into Vite's terser workers, so the build runs as a child.
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'

const WATCHED = ['packages', 'vite.config']

let building = false
let changed = false
let timer

const build = () => {
  if (building) {
    changed = true
    return
  }

  building = true

  const child = spawn(process.execPath, ['build-scripts/build-all.js'], {
    stdio: 'inherit',
  })

  // A spawn that fails emits 'error' and may never emit 'exit', so both
  // release the lock and whichever arrives first wins
  let finished = false
  const done = () => {
    if (finished) return
    finished = true
    building = false

    if (changed) {
      changed = false
      build()
    }
  }

  child.on('error', (error) => {
    console.error('Could not start the build:', error.message)
    done()
  })

  child.on('exit', done)
}

// An editor save can fire several events, so wait for them to settle
const schedule = () => {
  clearTimeout(timer)
  timer = setTimeout(build, 100)
}

for (const dir of WATCHED) watch(dir, { recursive: true }, schedule)

build()
