import type { MessageData } from '../message-data'

const toPixels = (value: string | null | undefined): number =>
  value ? parseInt(value, 10) : 0

// The padding and border on two sides of a border-box element
export function getBoxEnds(
  compStyle: CSSStyleDeclaration,
  start: 'Top' | 'Left',
  end: 'Bottom' | 'Right',
): number {
  if (compStyle.boxSizing !== 'border-box') return 0

  return (
    toPixels(compStyle[`padding${start}`]) +
    toPixels(compStyle[`padding${end}`]) +
    toPixels(compStyle[`border${start}Width`]) +
    toPixels(compStyle[`border${end}Width`])
  )
}

// A border-box iframe's size includes its padding and border, so they are
// added to the content size the child sent before it is applied
export default function withBoxSizing(messageData: MessageData): MessageData {
  const { iframe, height, width } = messageData
  if (!iframe) return messageData

  const compStyle = getComputedStyle(iframe)

  return {
    ...messageData,
    height: height + getBoxEnds(compStyle, 'Top', 'Bottom'),
    width: width + getBoxEnds(compStyle, 'Left', 'Right'),
  }
}
