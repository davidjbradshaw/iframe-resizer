type AdviseFn = (iframeId: string, message: string) => void

export default (advise: AdviseFn) =>
  (type: string, change = 'renamed to') =>
  (old: string, replacement: string, info = '', iframeId = ''): void =>
    advise(
      iframeId,
      `<rb>Deprecated ${type}(${old.replace('()', '')})</>\n\nThe <b>${old}</> ${type.toLowerCase()} has been ${change} <b>${replacement}</>. ${info}Use of the old ${type.toLowerCase()} will be removed in a future version of <i>iframe-resizer</>.`,
    )
