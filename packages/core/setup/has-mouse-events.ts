const hasMouseEvents = (options: Record<string, any>): boolean =>
  typeof options.onMouseEnter === 'function' ||
  typeof options.onMouseLeave === 'function'

export default hasMouseEvents
