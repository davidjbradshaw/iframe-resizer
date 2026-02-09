import settings from '../values/settings'

export const getTargetOrigin = (remoteHost) =>
  remoteHost === '' ||
  remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
    ? '*'
    : remoteHost

export function setTargetOrigin(id) {
  settings[id].targetOrigin =
    settings[id].checkOrigin === true
      ? getTargetOrigin(settings[id].remoteHost)
      : '*'
}

export function getPostMessageTarget(iframe) {
  const { id } = iframe
  if (settings[id].postMessageTarget === null)
    settings[id].postMessageTarget = iframe.contentWindow
}
