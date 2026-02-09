import { COLLAPSE } from '../../common/consts'

export default function (options) {
  const { search } = window.location

  if (search.includes('ifrlog')) {
    options.log = COLLAPSE
    options.logExpand = search.includes('ifrlog=expanded')
  }
}
