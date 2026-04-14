import { existsSync, lstatSync, unlinkSync } from 'node:fs'
import { execSync } from 'node:child_process'

export default function () {
  if (existsSync('js-dist') && lstatSync('js-dist').isSymbolicLink()) {
    unlinkSync('js-dist')
    // Restore the original js-dist directory from git
    execSync('git checkout -- js-dist', { stdio: 'ignore' })
  }
}
