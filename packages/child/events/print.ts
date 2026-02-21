import sendSize from '../send/size'
import { addEventListener } from './listeners'

function add({ eventType, eventName }: { eventType: string; eventName: string }): void {
  const handleEvent = () => sendSize(eventName, eventType)
  addEventListener(window, eventName, handleEvent, { passive: true })
}

export default function setupPrintListeners(): void {
  add({
    eventType: 'After Print',
    eventName: 'afterprint',
  })

  add({
    eventType: 'Before Print',
    eventName: 'beforeprint',
  })
}
