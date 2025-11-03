import sendSize from '../send/size'
import { addEventListener } from './listeners'

function add({ eventType, eventName }) {
  const handleEvent = () => sendSize(eventName, eventType)
  addEventListener(window, eventName, handleEvent, { passive: true })
}

export default function setupPrintListeners() {
  add({
    eventType: 'After Print',
    eventName: 'afterprint',
  })

  add({
    eventType: 'Before Print',
    eventName: 'beforeprint',
  })
}
