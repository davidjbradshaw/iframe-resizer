import type { IFrameComponent } from './types'

export interface MessageData {
  id: string
  iframe: IFrameComponent
  height: number
  width: number
  type: string
  message?: string
  mode?: string
}
