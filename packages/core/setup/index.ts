import { HIGHLIGHT } from 'auto-console-group'

import { preModeCheck } from '../checks/mode'
import checkUniqueId from '../checks/unique'
import { endAutoGroup, event as consoleEvent, log } from '../console'
import attachMethods from '../methods/attach'
import createOutgoingMessage from '../send/outgoing'
import setupBodyMargin from './body-margin'
import init from './init'
import processOptions from './process-options'
import setScrolling from './scrolling'

function setup(id: string, iframe: HTMLIFrameElement, options: Record<string, any>): void {
  processOptions(iframe, options)
  log(id, `src: %c${iframe.srcdoc || iframe.src}`, HIGHLIGHT)
  preModeCheck(id)
  setScrolling(iframe)
  setupBodyMargin(id)
  init(id, createOutgoingMessage(id))
  attachMethods(id)
  log(id, 'Setup complete')
}

export default function (iframe: HTMLIFrameElement, options: Record<string, any>): void {
  const { id } = iframe
  consoleEvent(id, 'setup')
  if (checkUniqueId(id)) setup(id, iframe, options)
  endAutoGroup(id)
}
