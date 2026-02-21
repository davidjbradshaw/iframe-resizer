import { BASE } from '../../common/consts'

// getBodyOffset
export default (): number => {
  const { body } = document
  const style = getComputedStyle(body)

  return (
    body.offsetHeight +
    parseInt(style.marginTop, BASE) +
    parseInt(style.marginBottom, BASE)
  )
}
