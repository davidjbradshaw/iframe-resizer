import { PARENT_RESIZE_REQUEST } from '../../common/consts'
import { log } from '../console'
import sendSize from '../send/size'

// This method is used by the tabVisible event on the parent page
export default function resize(): void {
  log('Resize requested by host page')
  sendSize(PARENT_RESIZE_REQUEST, 'Parent window requested size check')
}
