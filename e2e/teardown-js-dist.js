import { existsSync, lstatSync, unlinkSync } from 'node:fs'

export default function () {
  if (existsSync('js-dist') && lstatSync('js-dist').isSymbolicLink()) {
    unlinkSync('js-dist')
  }
}
