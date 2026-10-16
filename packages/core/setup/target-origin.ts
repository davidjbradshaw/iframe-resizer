import { getOrigin } from '@iframe-resizer/common'

import { warn } from '../console'
import settings from '../values/settings'

// A page with an opaque origin ('null'), such as a data: URL, can only be
// messaged with '*'
export const getTargetOrigin = (remoteHost: string): string =>
  remoteHost === '' ||
  remoteHost === 'null' ||
  remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
    ? '*'
    : remoteHost

// The origin the iframe's src points at, which is the only one allowed
// to message the parent when checkOrigin is true
export function setRemoteHost(id: string): void {
  const { iframe } = settings[id]
  settings[id].remoteHost = getOrigin(iframe.src) ?? ''
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

// The src can be set, or changed, after the iframe was bound
export function refreshRemoteHost(id: string): void {
  const { remoteHost } = settings[id]
  setRemoteHost(id)
  if (settings[id].remoteHost !== remoteHost) setTargetOrigin(id)
}

// The window given as the postMessageTarget option, or else the iframe's
// current window, which changes when the iframe is moved and is null
// while it is out of the document. An ID left unbound as a duplicate
// has settings for its console but no iframe
export const getPostMessageTarget = (id: string): MessageEventSource | null =>
  settings[id].postMessageTarget ?? settings[id].iframe?.contentWindow ?? null
