import { TITLE } from '../../common/consts'
import sendMessage from './message'

export default function sendTitle(): void {
  const { title } = document
  if (title && title !== '') sendMessage(0, 0, TITLE, title)
}
