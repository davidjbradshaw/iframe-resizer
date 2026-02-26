import { endAutoGroup, errorBoundary, event as consoleEvent } from '../console'
import dispatch from './dispatch'

export default errorBoundary(
  (height: number, width: number, triggerEvent: string, message?: string, targetOrigin?: string): void => {
    consoleEvent(triggerEvent)
    dispatch(height, width, triggerEvent, message, targetOrigin)
    endAutoGroup()
  },
)
