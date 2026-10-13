import { typeAssert } from '@iframe-resizer/common'
import { MANUAL_RESIZE_REQUEST, NUMBER } from '@iframe-resizer/common/consts'

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

  // A width alone still shows the missing height: resize(undefined,200)
  const height = customHeight ?? (customWidth === undefined ? '' : 'undefined')
  const width = customWidth === undefined ? '' : `,${customWidth}`
  const valString = `${height}${width}`

  sendSize(
    MANUAL_RESIZE_REQUEST,
    `parentIframe.resize(${valString})`,
    customHeight,
    customWidth,
  )
}
