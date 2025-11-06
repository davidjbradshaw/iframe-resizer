import { IGNORE_TAGS } from '../../common/consts'

const addNot = (tagName) => `:not(${tagName})`
const selector = `* ${Array.from(IGNORE_TAGS).map(addNot).join('')}`

export const getAllElements = (node) => node.querySelectorAll(selector)

export const getAllMeasurements = (dimension) => [
  dimension.bodyOffset(),
  dimension.bodyScroll(),
  dimension.documentElementOffset(),
  dimension.documentElementScroll(),
  dimension.boundingClientRect(),
]
