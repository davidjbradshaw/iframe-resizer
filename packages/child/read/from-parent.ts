const strBool = (str: string): boolean => str === 'true'

const castDefined = <T>(cast: (data: string) => T) => (data: string | undefined): T | undefined =>
  undefined === data ? undefined : cast(data)

const getBoolean = castDefined(strBool)
const getNumber = castDefined(Number)

export default (data: string[]): Record<string, any> => ({
  parentId: data[0],
  bodyMargin: getNumber(data[1]),
  calculateWidth: getBoolean(data[2]),
  logging: getBoolean(data[3]),
  // data[4] no longer used (was intervalTimer)
  autoResize: getBoolean(data[6]),
  bodyMarginStr: data[7],
  heightCalcMode: data[8],
  bodyBackground: data[9],
  bodyPadding: data[10],
  tolerance: getNumber(data[11]),
  inPageLinks: getBoolean(data[12]),
  // data[13] no longer used (was resizeFrom)
  widthCalcMode: data[14],
  mouseEvents: getBoolean(data[15]),
  offsetHeight: getNumber(data[16]),
  offsetWidth: getNumber(data[17]),
  calculateHeight: getBoolean(data[18]),
  key: data[19],
  version: data[20],
  mode: getNumber(data[21]),
  // sizeSelector: data[22] // Now only available via page settings
  logExpand: getBoolean(data[23]),
})
