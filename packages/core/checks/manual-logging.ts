import { COLLAPSE, EXPAND, LOG_COLLAPSED, LOG_DISABLED, LOG_EXPANDED } from '../../common/consts'

export default function (options: Record<string, any>): void {
  const { search } = window.location

  if (search.includes('ifrlog')) {
    const value = new URLSearchParams(search).get('ifrlog')

    if (value === String(LOG_DISABLED)) {
      options.log = false
    } else if (value === EXPAND || value === String(LOG_EXPANDED)) {
      options.log = EXPAND
    } else if (value === COLLAPSE || value === String(LOG_COLLAPSED)) {
      options.log = COLLAPSE
    } else {
      options.log = COLLAPSE
    }
  }
}
