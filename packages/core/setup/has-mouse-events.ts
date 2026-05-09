import { hasOwn } from '@iframe-resizer/common'

const hasMouseEvents = (options: Record<string, any>): boolean =>
  hasOwn(options, 'onMouseEnter') || hasOwn(options, 'onMouseLeave')

export default hasMouseEvents
