import { AUTO, NONE } from '../../common/consts'
import { advise, log } from '../console'

const nodes = (): HTMLElement[] => [document.documentElement, document.body]
const properties = ['min-height', 'min-width', 'max-height', 'max-width']

const blockedStyleSheets = new Set()

export const hasCssValue = (value: string): boolean =>
  !!value && value !== '0px' && value !== AUTO && value !== NONE

export const getElementName = (node: Element): string =>
  node.tagName ? node.tagName.toLowerCase() : 'unknown'

const getComputedStyle = (node: Element, property: string): string =>
  window.getComputedStyle(node).getPropertyValue(property)

export const hasBlockingCSS = (node: Element, property: string): boolean =>
  hasCssValue(getComputedStyle(node, property))

export function getInlineStyleValue(
  node: HTMLElement,
  property: string,
): { source: string; value: string } | null {
  const inlineValue = node.style.getPropertyValue(property)
  return inlineValue
    ? { source: 'an inline style attribute', value: inlineValue }
    : null
}

export function crossOriginStylesheetError({
  href,
}: {
  href: string | null
}): void {
  if (blockedStyleSheets.has(href)) return
  log('Unable to access stylesheet:', href)
  blockedStyleSheets.add(href)
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getStyleSheetCSSPropertyValue(
  node: Element,
  property: string,
): { source: string; value: string } {
  for (const stylesheet of document.styleSheets) {
    try {
      for (const rule of stylesheet.cssRules || []) {
        if (!('selectorText' in rule)) continue

        const styleRule = rule as CSSStyleRule
        if (!node.matches(styleRule.selectorText)) continue

        const ruleValue = styleRule.style.getPropertyValue(property)
        if (!ruleValue) continue

        const { ownerNode } = stylesheet
        const sourceType =
          ownerNode instanceof Element && ownerNode.tagName === 'STYLE'
            ? 'an inline <style> block'
            : `stylesheet (${stylesheet.href})`

        return {
          source: sourceType,
          value: ruleValue,
        }
      }
    } catch (error) {
      crossOriginStylesheetError(stylesheet)
    }
  }

  return {
    source: 'cross-origin stylesheet',
    value: getComputedStyle(node, property),
  }
}

export const getSetCSSPropertyValue = (
  node: HTMLElement,
  property: string,
): { source: string; value: string } =>
  getInlineStyleValue(node, property) ||
  getStyleSheetCSSPropertyValue(node, property)

const showCssWarning = (node: HTMLElement, property: string): void => {
  const { source, value } = getSetCSSPropertyValue(node, property)
  const nodeName = getElementName(node)

  advise(
    `The <b>${property}</> CSS property is set to <b>${value}</> on the <b><${nodeName}></> element via ${source}. This may cause issues with the correct operation of <i>iframe-resizer</>.\n\nIf you wish to restrict the size of the iframe, then you should set this property on the iframe element itself, not the content inside it.`,
  )
}

export default function checkBlockingCSS(): void {
  for (const node of nodes()) {
    for (const property of properties) {
      log(`Checking <${getElementName(node)}> for blocking CSS: ${property}`)
      if (hasBlockingCSS(node, property)) showCssWarning(node, property)
    }
  }
}
