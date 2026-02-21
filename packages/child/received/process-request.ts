import state from '../values/state'
import init from './init'
import message from './message'
import pageInfo from './page-info'
import parentInfo from './parent-info'
import reset from './reset'
import resize from './resize'
import { getData } from './utils'

const moveToAnchor = (event: MessageEvent): void => state.inPageLinks.findTarget(getData(event))

export default {
  init,
  reset,
  resize,
  moveToAnchor,
  inPageLink: moveToAnchor, // Backward compatibility
  pageInfo,
  parentInfo,
  message,
}
