import type { MessageData } from '../message-data'

const toPixels = (value: string | null | undefined): number =>
  value ? parseInt(value, 10) : 0

export function getPaddingEnds(compStyle: CSSStyleDeclaration): number {
  if (compStyle.boxSizing !== 'border-box') return 0

  return toPixels(compStyle.paddingTop) + toPixels(compStyle.paddingBottom)
}

export function getBorderEnds(compStyle: CSSStyleDeclaration): number {
  if (compStyle.boxSizing !== 'border-box') return 0

  return (
    toPixels(compStyle.borderTopWidth) + toPixels(compStyle.borderBottomWidth)
  )
}

// A border-box iframe's size includes its padding and border, so they are
// added to the content size the child sent before it is applied
export default function withBoxSizing(messageData: MessageData): MessageData {
  const { iframe, height } = messageData
  if (!iframe) return messageData

  const compStyle = getComputedStyle(iframe)

  return {
    ...messageData,
    height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
  }
}
