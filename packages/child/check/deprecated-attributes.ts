import { SIZE_ATTR } from '../../common/consts'
import { advise } from '../console'

const DEPRECATED = `<rb>Deprecated Attributes</>

The <b>data-iframe-height</> and <b>data-iframe-width</> attributes have been deprecated and replaced with the single <b>data-iframe-size</> attribute. Use of the old attributes will be removed in a future version of <i>iframe-resizer</>.`

export default function checkDeprecatedAttrs(): void {
  let found = false

  const checkAttrs = (attr: string): void =>
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
      el.toggleAttribute(SIZE_ATTR, true)
      el.removeAttribute(attr)
      found = true
    })

  checkAttrs('data-iframe-height')
  checkAttrs('data-iframe-width')

  if (found) advise(DEPRECATED)
}
