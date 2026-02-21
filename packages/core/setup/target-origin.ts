import settings from '../values/settings'

export const getTargetOrigin = (remoteHost: string): string =>
  remoteHost === '' ||
  remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
    ? '*'
    : remoteHost

export function setTargetOrigin(id: string): void {
  settings[id].targetOrigin =
    settings[id].checkOrigin === true
      ? getTargetOrigin(settings[id].remoteHost)
      : '*'
}

export function getPostMessageTarget(iframe: HTMLIFrameElement): void {
  const { id } = iframe
  if (settings[id].postMessageTarget === null)
    settings[id].postMessageTarget = iframe.contentWindow
}
