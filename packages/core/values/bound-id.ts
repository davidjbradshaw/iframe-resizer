import settings from './settings'

// The id an iframe was bound under. Its id attribute can change later, but
// the child and the settings keep the first one.
export default function getBoundId(iframe: HTMLIFrameElement): string {
  return (
    Object.keys(settings).find((id) => settings[id].iframe === iframe) ??
    iframe.id
  )
}
