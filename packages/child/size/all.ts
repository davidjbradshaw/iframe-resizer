import { IGNORE_TAGS } from '../../common/consts'

const addNot = (tagName: string): string => `:not(${tagName})`
const selector = `* ${Array.from(IGNORE_TAGS).map(addNot).join('')}`

export const getAllElements = (node: Element): NodeListOf<Element> => node.querySelectorAll(selector)

export const getAllMeasurements = (dimension: any): number[] => [
  dimension.bodyOffset(),
  dimension.bodyScroll(),
  dimension.documentElementOffset(),
  dimension.documentElementScroll(),
  dimension.boundingClientRect(),
]
