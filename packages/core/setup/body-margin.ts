import { NUMBER } from '../../common/consts'
import settings from '../values/settings'

const ZERO = '0'

export default function setupBodyMargin(id: string): void {
  const { bodyMargin } = settings[id]

  if (typeof bodyMargin === NUMBER || bodyMargin === ZERO) {
    settings[id].bodyMargin = `${bodyMargin}px`
  }
}
