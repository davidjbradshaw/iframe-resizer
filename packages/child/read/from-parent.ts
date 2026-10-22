import { unescapeField } from '@iframe-resizer/common'

const strBool = (str: string): boolean => str === 'true'

const castDefined =
  <T>(cast: (data: string) => T) =>
  (data: string | undefined): T | undefined =>
    undefined === data ? undefined : cast(data)

const getBoolean = castDefined(strBool)
const getNumber = castDefined(Number)
const getText = castDefined(unescapeField)

// An offset the parent has no value for arrives as an empty field, which is
// not the same as one it has set to zero to clear what the page set itself
const getOffset = (data: string | undefined): number | undefined =>
  data === '' ? undefined : getNumber(data)

export default (data: string[]): Record<string, any> => ({
  parentId: getText(data[0]),
  bodyMargin: getNumber(data[1]),
  calculateWidth: getBoolean(data[2]),
  logging: getBoolean(data[3]),
  // data[4] no longer used (was intervalTimer)
  autoResize: getBoolean(data[6]),
  bodyMarginStr: getText(data[7]),
  // data[8] no longer used (was heightCalcMode)
  bodyBackground: getText(data[9]),
  bodyPadding: getText(data[10]),
  tolerance: getNumber(data[11]),
  inPageLinks: getBoolean(data[12]),
  // data[13] no longer used (was resizeFrom)
  // data[14] no longer used (was widthCalcMode)
  mouseEvents: getBoolean(data[15]),
  offsetHeight: getOffset(data[16]),
  offsetWidth: getOffset(data[17]),
  calculateHeight: getBoolean(data[18]),
  key: data[19],
  version: data[20],
  mode: getNumber(data[21]),
  // sizeSelector: data[22] // Now only available via page settings
  logExpand: getBoolean(data[23]),
  maxContentWidth: getBoolean(data[24]),
  bindId: data[25],
})
