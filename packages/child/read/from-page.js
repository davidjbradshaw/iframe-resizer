import { HIGHLIGHT } from 'auto-console-group'

import {
  BOOLEAN,
  FUNCTION,
  HEIGHT,
  NUMBER,
  OBJECT,
  OFFSET,
  OFFSET_SIZE,
  STRING,
  WIDTH,
} from '../../common/consts'
import { getKey } from '../../common/mode'
import { deprecateOption, info, log } from '../console'
// import { setupCustomCalcMethods } from '../methods/custom-calcs'
import settings from '../values/settings'

const read = (type) => (data, key) => {
  if (!(key in data)) return
  // eslint-disable-next-line valid-typeof, consistent-return
  if (typeof data[key] === type) return data[key]

  throw new TypeError(`${key} is not a ${type}.`)
}

export const readFunction = read(FUNCTION)
export const readBoolean = read(BOOLEAN)
export const readNumber = read(NUMBER)
export const readString = read(STRING)

function readData(data, setupCustomCalcMethods) {
  const { calculateHeight, calculateWidth } = settings
  let offsetHeight
  let offsetWidth

  log(`Reading data from page:`, Object.keys(data))

  if (typeof data?.offset === NUMBER) {
    deprecateOption(OFFSET, OFFSET_SIZE)
    if (calculateHeight) offsetHeight = readNumber(data, OFFSET)
    if (calculateWidth) offsetWidth = readNumber(data, OFFSET)
  }

  if (typeof data?.offsetSize === NUMBER) {
    if (calculateHeight) offsetHeight = readNumber(data, OFFSET_SIZE)
    if (calculateWidth) offsetWidth = readNumber(data, OFFSET_SIZE)
  }

  return {
    offsetHeight,
    offsetWidth,
    key2: readString(data, getKey(0)),
    ignoreSelector: readString(data, 'ignoreSelector'),
    sizeSelector: readString(data, 'sizeSelector'),

    targetOrigin: readString(data, 'targetOrigin'),

    heightCalcMode: setupCustomCalcMethods(
      data?.heightCalculationMethod,
      HEIGHT,
    ),
    widthCalcMode: setupCustomCalcMethods(data?.widthCalculationMethod, WIDTH),

    onBeforeResize: readFunction(data, 'onBeforeResize'),
    onMessage: readFunction(data, 'onMessage'),
    onReady: readFunction(data, 'onReady'),
  }
}

export default function readDataFromPage(setupCustomCalcMethods) {
  const { mode, targetOrigin } = settings
  if (mode === 1) return {}

  const data = window.iframeResizer || window.iFrameResizer

  if (typeof data !== OBJECT) {
    return {}
  }

  const localSettings = readData(data, setupCustomCalcMethods)

  info(
    `Set targetOrigin for parent: %c${localSettings.targetOrigin || targetOrigin}`,
    HIGHLIGHT,
  )

  return localSettings
}
