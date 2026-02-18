import { HIGHLIGHT } from 'auto-console-group'

import { NULL } from '../../common/consts'
import { info, warn } from '../console'

export function checkCSS(attr: string, value: string): string {
  if (value.includes('-')) {
    warn(`Negative CSS value ignored for ${attr}`)
    value = ''
  }

  return value
}

export function setBodyStyle(attr: string, value: string | undefined): void {
  if (undefined === value || value === '' || value === NULL) return

  document.body.style.setProperty(attr, value)
  info(`Set body ${attr}: %c${value}`, HIGHLIGHT)
}

export function setMargin({ bodyMarginStr, bodyMargin }: { bodyMarginStr: string | undefined; bodyMargin: number }): void {
  // If called via V1 script, convert bodyMargin from int to str
  if (undefined === bodyMarginStr) {
    bodyMarginStr = `${bodyMargin}px`
  }

  setBodyStyle('margin', checkCSS('margin', bodyMarginStr))
}
