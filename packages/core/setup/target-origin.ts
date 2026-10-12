import { warn } from '../console'
import settings from '../values/settings'

export const getTargetOrigin = (remoteHost: string): string =>
  remoteHost === '' ||
  remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
    ? '*'
    : remoteHost

// The origin the iframe's src points at, which is the only one allowed
// to message the parent when checkOrigin is true
export function setRemoteHost(id: string): void {
  const { iframe } = settings[id]
  settings[id].remoteHost = iframe.src.split('/').slice(0, 3).join('/')
}

export function setTargetOrigin(id: string): void {
  const { checkOrigin, remoteHost } = settings[id]

  if (Array.isArray(checkOrigin) && checkOrigin.length === 0) {
    warn(
      id,
      'checkOrigin is an empty array — no messages will be sent to the iframe',
    )
  }

  settings[id].targetOrigin = Array.isArray(checkOrigin)
    ? checkOrigin.map(getTargetOrigin)
    : [checkOrigin === false ? '*' : getTargetOrigin(remoteHost)]
}

export function getPostMessageTarget(iframe: HTMLIFrameElement): void {
  const { id } = iframe
  if (settings[id].postMessageTarget === null)
    settings[id].postMessageTarget = iframe.contentWindow
}
