// Core sizes the iframe by writing height, width and overflow on it, so a
// wholesale style write must put back any of them it does not itself set
const MANAGED_STYLES = ['height', 'width', 'overflow']

export default function setStyleKeepingSize(
  el: HTMLElement,
  cssText: string | null | undefined,
): void {
  const kept = MANAGED_STYLES.map((name) => [
    name,
    el.style.getPropertyValue(name),
    el.style.getPropertyPriority(name),
  ])

  el.style.cssText = cssText || ''

  for (const [name, value, priority] of kept)
    if (value !== '' && el.style.getPropertyValue(name) === '')
      el.style.setProperty(name, value, priority)
}
