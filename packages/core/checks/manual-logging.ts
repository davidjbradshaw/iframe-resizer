import { COLLAPSE, EXPAND, LOG_DISABLED, LOG_EXPANDED } from '../../common/consts'

export default function (options: Record<string, any>): void {
  const { search } = window.location

  if (search.includes('ifrlog')) {
    const value = new URLSearchParams(search).get('ifrlog')

    if (value === String(LOG_DISABLED)) {
      options.log = false
    } else if (value === 'expanded' || value === String(LOG_EXPANDED)) {
      options.log = EXPAND
    } else {
      options.log = COLLAPSE
    }
  }
}
