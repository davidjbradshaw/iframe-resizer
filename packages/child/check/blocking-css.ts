import { AUTO, NONE } from '../../common/consts'
import { advise, log } from '../console'

const nodes = (): Element[] => [document.documentElement, document.body]
const properties = ['min-height', 'min-width', 'max-height', 'max-width']

const blockedStyleSheets = new Set()

const hasCssValue = (value: string): boolean =>
  !!value && value !== '0px' && value !== AUTO && value !== NONE

const getElementName = (node: Element): string =>
  node.tagName ? node.tagName.toLowerCase() : 'unknown'

const getComputedStyle = (node: Element, property: string): string =>
  window.getComputedStyle(node).getPropertyValue(property)

const hasBlockingCSS = (node: Element, property: string): boolean =>
  hasCssValue(getComputedStyle(node, property))

function getInlineStyleValue(node: HTMLElement, property: string): { source: string; value: string } | null {
  const inlineValue = node.style[property]
  return inlineValue
    ? { source: 'an inline style attribute', value: inlineValue }
    : null
}

function crossOriginStylesheetError({ href }: { href: string | null }): void {
  if (blockedStyleSheets.has(href)) return
  log('Unable to access stylesheet:', href)
  blockedStyleSheets.add(href)
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function getStyleSheetCSSPropertyValue(node: Element, property: string): { source: string; value: string } {
  for (const stylesheet of document.styleSheets) {
    try {
      for (const rule of stylesheet.cssRules || []) {
        if (rule.selectorText && node.matches(rule.selectorText)) {
          const ruleValue = rule.style[property]
          if (ruleValue) {
            const sourceType =
              stylesheet.ownerNode.tagName === 'STYLE'
                ? 'an inline <style> block'
                : `stylesheet (${stylesheet.href})`

            return {
              source: sourceType,
              value: ruleValue,
            }
          }
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

const getSetCSSPropertyValue = (node: HTMLElement, property: string): { source: string; value: string } =>
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
