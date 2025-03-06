export default (advise) =>
  (type, change = 'renamed to') =>
  (old, replacement, info = '') =>
    advise(
      `<rb>Deprecated ${type} (${old})</>\n\nThe <b>${old}</> ${type.toLowerCase()} has been ${change} <b>${replacement}</>. ${info}Use of the old ${type.toLowerCase()} will be removed in a future version of <i>iframe-resizer</>.`,
    )
