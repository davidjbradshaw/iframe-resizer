import { existsSync, lstatSync, rmSync, symlinkSync, unlinkSync } from 'node:fs'

// Replace js-dist (directory or symlink) with symlink → js
// so example HTML pages load the current dev build
if (existsSync('js-dist')) {
  if (lstatSync('js-dist').isSymbolicLink()) {
    unlinkSync('js-dist')
  } else {
    rmSync('js-dist', { recursive: true })
  }
}
symlinkSync('js', 'js-dist')
