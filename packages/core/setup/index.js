import { HIGHLIGHT } from 'auto-console-group'

import { preModeCheck } from '../checks/mode'
import { endAutoGroup, log } from '../console'
import attachMethods from '../methods/attach'
import checkUniqueId from '../page/unique'
import createOutgoingMessage from '../send/outgoing'
import setupBodyMargin from './body-margin'
import init from './init'
import processOptions from './process-options'
import setScrolling from './scrolling'

export default function setupIframe(iframe, options) {
  const { id } = iframe

  processOptions(iframe, options)
  checkUniqueId(id)
  log(id, `src: %c${iframe.srcdoc || iframe.src}`, HIGHLIGHT)
  preModeCheck(id)
  setScrolling(iframe)
  setupBodyMargin(id)
  init(id, createOutgoingMessage(id))
  attachMethods(id)
  log(id, 'Setup complete')
  endAutoGroup(id)
}
