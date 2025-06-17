import { advise, log } from './console'

const nodes = () => [document.documentElement, document.body]
const properties = ['min-height', 'min-width', 'max-height', 'max-width']

const hasCssValue = (value) =>
  value && value !== '0px' && value !== 'auto' && value !== 'none'

const getElementName = (node) =>
  node.tagName ? node.tagName.toLowerCase() : 'unknown'

const getComputedStyle = (node, property) =>
  window.getComputedStyle(node)?.getPropertyValue(property)

const hasBlockingCSS = (node, property) =>
  hasCssValue(getComputedStyle(node, property))

const blockedStyleSheets = new Set()

function getInlineStyleValue(node, property) {
  const inlineValue = node.style[property]
  return inlineValue
    ? { source: 'inline style attribute', value: inlineValue }
    : null
}

function crossOriginStylesheetError({ href }) {
  if (blockedStyleSheets.has(href)) return
  log('Unable to access stylesheet:', href)
  blockedStyleSheets.add(href)
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function getStyleSheetCSSPropertyValue(node, property) {
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

const getSetCSSPropertyValue = (node, property) =>
  getInlineStyleValue(node, property) ||
  getStyleSheetCSSPropertyValue(node, property)

const showCssWarning = (node, property) => {
  const { source, value } = getSetCSSPropertyValue(node, property)
  const nodeName = getElementName(node)

  advise(
    `The <b>${property}</> CSS property is set to <b>${value}</> on the <b><${nodeName}></> element via ${source}. This may cause issues with the correct operation of <i>iframe-resizer</>.`,
  )
}

export default function checkBlockingCSS() {
  for (const node of nodes()) {
    for (const property of properties) {
      log(`Checking <${getElementName(node)}> for blocking CSS: ${property}`)
      if (hasBlockingCSS(node, property)) showCssWarning(node, property)
    }
  }
}
