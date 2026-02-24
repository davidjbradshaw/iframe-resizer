import settings from '../values/settings'

export const getTargetOrigin = (remoteHost: string): string =>
  remoteHost === '' ||
  remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
    ? '*'
    : remoteHost

export function setTargetOrigin(id: string): void {
  const { checkOrigin, remoteHost } = settings[id]

  settings[id].targetOrigin =
    checkOrigin === false
      ? '*'
      : Array.isArray(checkOrigin)
        ? checkOrigin.map(getTargetOrigin)
        : getTargetOrigin(remoteHost)
}

export function getPostMessageTarget(iframe: HTMLIFrameElement): void {
  const { id } = iframe
  if (settings[id].postMessageTarget === null)
    settings[id].postMessageTarget = iframe.contentWindow
}
