import {
  AUTO_RESIZE,
  BOTH,
  HORIZONTAL,
  NONE,
  VERTICAL,
} from '../../common/consts'
import { advise } from '../console'

export default function checkOptions(id: string, options: Record<string, any> | undefined): Record<string, any> {
  if (!options) return {}

  if (
    'sizeWidth' in options ||
    'sizeHeight' in options ||
    AUTO_RESIZE in options
  ) {
    advise(
      id,
      `<rb>Deprecated Option</>

The <b>sizeWidth</>, <b>sizeHeight</> and <b>autoResize</> options have been replaced with new <b>direction</> option which expects values of <bb>${VERTICAL}</>, <bb>${HORIZONTAL}</>, <bb>${BOTH}</> or <bb>${NONE}</>.
`,
    )
  }

  return options
}
