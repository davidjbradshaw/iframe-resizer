import {
  COLLAPSE,
  EXPAND,
  LOG_COLLAPSED,
  LOG_DISABLED,
  LOG_EXPANDED,
} from '../../common/consts'

export default function (options: Record<string, any>): void {
  const { search } = window.location

  if (search.includes('ifrlog')) {
    const value = new URLSearchParams(search).get('ifrlog')

    switch (value) {
      case String(LOG_DISABLED): {
        options.log = false
        break
      }

      case EXPAND:
      case String(LOG_EXPANDED): {
        options.log = EXPAND
        break
      }

      default: {
        options.log = COLLAPSE
      }
    }
  }
}
