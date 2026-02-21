import { HIGHLIGHT } from 'auto-console-group'

import { isolateUserCode } from '../../common/utils'
import { log } from '../console'
import settings from '../values/settings'
import { getData, parse, parseFrozen } from './utils'

export default function message(event: MessageEvent): void {
  const msgBody = getData(event)

  log(`onMessage called from parent:%c`, HIGHLIGHT, parseFrozen(msgBody))

  // eslint-disable-next-line sonarjs/no-extra-arguments
  isolateUserCode(settings.onMessage, parse(msgBody))
}
