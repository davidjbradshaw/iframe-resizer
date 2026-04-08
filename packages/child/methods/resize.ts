import { MANUAL_RESIZE_REQUEST, NUMBER } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import sendSize from '../send/size'

export default function resize(
  customHeight?: number,
  customWidth?: number,
): void {
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

  const height = customHeight === undefined ? '' : customHeight
  const width = customWidth === undefined ? '' : `,${customWidth}`
  const valString = `${height}${width}`

  sendSize(
    MANUAL_RESIZE_REQUEST,
    `parentIframe.resize(${valString})`,
    customHeight,
    customWidth,
  )
}
