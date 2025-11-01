import { endAutoGroup, errorBoundary, event as consoleEvent } from '../console'
import dispatch from './dispatch'

export default errorBoundary(
  (height, width, triggerEvent, message, targetOrigin) => {
    consoleEvent(triggerEvent)
    dispatch(height, width, triggerEvent, message, targetOrigin)
    endAutoGroup()
  },
)
