import {
  FUNCTION,
  NUMBER,
  OBJECT,
  OFFSET,
  OFFSET_SIZE,
  STRING,
} from '../../common/consts'
import { getKey } from '../../common/mode'
import { deprecateOption, log } from '../console'
import settings from '../values/settings'

const read = (type: string) => (data: Record<string, any>, key: string): any => {
  if (!(key in data)) return
  // eslint-disable-next-line valid-typeof, consistent-return
  if (typeof data[key] === type) return data[key]

  throw new TypeError(`${key} is not a ${type}.`)
}

export const readFunction = read(FUNCTION)
export const readNumber = read(NUMBER)
export const readString = read(STRING)

const isObject = (obj: any): obj is Record<string, any> =>
  obj !== null && typeof obj === OBJECT && !Array.isArray(obj)

function readOffsetSize(data: Record<string, any>): { offsetHeight: number | undefined; offsetWidth: number | undefined } {
  const { calculateHeight, calculateWidth } = settings
  let offsetHeight
  let offsetWidth

  if (typeof data?.offset === NUMBER) {
    deprecateOption(OFFSET, OFFSET_SIZE)
    if (calculateHeight) offsetHeight = readNumber(data, OFFSET)
    if (calculateWidth) offsetWidth = readNumber(data, OFFSET)
  }

  if (typeof data?.offsetSize === NUMBER) {
    if (calculateHeight) offsetHeight = readNumber(data, OFFSET_SIZE)
    if (calculateWidth) offsetWidth = readNumber(data, OFFSET_SIZE)
  }

  return { offsetHeight, offsetWidth }
}

function readData(data: Record<string, any>): Record<string, any> {
  log(`Reading data from page:`, Object.keys(data))

  const { offsetHeight, offsetWidth } = readOffsetSize(data)

  return {
    offsetHeight,
    offsetWidth,
    ignoreSelector: readString(data, 'ignoreSelector'),
    key2: readString(data, getKey(0)),
    sizeSelector: readString(data, 'sizeSelector'),
    targetOrigin: readString(data, 'targetOrigin'),

    onBeforeResize: readFunction(data, 'onBeforeResize'),
    onMessage: readFunction(data, 'onMessage'),
    onReady: readFunction(data, 'onReady'),
  }
}

export default function readDataFromPage(): Record<string, any> {
  const { mode } = settings
  if (mode === 1) return {}

  const data = window.iframeResizer || window.iFrameResizer
  return isObject(data) ? readData(data) : {}
}
