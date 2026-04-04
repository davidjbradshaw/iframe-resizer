import { AUTO } from '../../common/consts'
import { warn } from '../console'

/** Settings for the child iframe script.
 *  Static fields have defaults; dynamic fields are populated at runtime
 *  from the parent-page init message and the in-page iframeResizer config.
 */
export interface ChildSettings {
  // Static defaults
  autoResize: boolean
  bodyBackground: string
  bodyMargin: number
  bodyMarginStr: string
  bodyPadding: string
  calculateHeight: boolean
  calculateWidth: boolean
  heightCalcMode: string
  ignoreSelector: string
  inPageLinks: boolean
  logging: boolean
  logExpand: boolean
  mode: number
  mouseEvents: boolean
  offsetHeight: number
  offsetWidth: number
  sizeSelector: string
  targetOrigin: string
  tolerance: number
  widthCalcMode: string
  onBeforeResize:
    | ((
        newSize: number,
        event: string,
        direction: 'height' | 'width',
      ) => number)
    | undefined
  onMessage: (message: any) => void
  onReady: () => void
  // Dynamic fields populated at runtime from parent / page init data
  parentId?: string
  version?: string
  key?: string
  key2?: string
}

const settings: ChildSettings = {
  autoResize: true,
  bodyBackground: '',
  bodyMargin: 0, // For V1 compatibility
  bodyMarginStr: '',
  bodyPadding: '',
  calculateHeight: true,
  calculateWidth: false,
  heightCalcMode: AUTO,
  ignoreSelector: '',
  inPageLinks: false,
  logging: false,
  logExpand: false,
  mode: 0,
  mouseEvents: false,
  offsetHeight: 0,
  offsetWidth: 0,
  parentId: undefined,
  sizeSelector: '',
  targetOrigin: '*',
  tolerance: 0,
  widthCalcMode: AUTO,

  onBeforeResize: undefined,
  onMessage: () => {
    warn('onMessage function not defined')
  },
  onReady: () => {},
}

export default settings
