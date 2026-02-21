import { MANUAL_RESIZE_REQUEST, NUMBER } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import sendSize from '../send/size'

export default function resize(customHeight?: number, customWidth?: number): void {
  if (customHeight !== undefined)
    typeAssert(
      customHeight,
      NUMBER,
      'parentIframe.resize(customHeight, customWidth) customHeight',
    )

  if (customWidth !== undefined)
    typeAssert(
      customWidth,
      NUMBER,
      'parentIframe.resize(customHeight, customWidth) customWidth',
    )

  const valString = `${customHeight || ''}${customWidth ? `,${customWidth}` : ''}`

  sendSize(
    MANUAL_RESIZE_REQUEST,
    `parentIframe.resize(${valString})`,
    customHeight,
    customWidth,
  )
}
