import { existsSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs'

// Symlink js-dist → js so example HTML pages load the current dev build
if (existsSync('js-dist') && lstatSync('js-dist').isSymbolicLink()) {
  unlinkSync('js-dist')
}
if (!existsSync('js-dist')) {
  symlinkSync('js', 'js-dist')
}
