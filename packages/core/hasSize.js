const slice = Function.call.bind(Array.prototype.slice)
const matches = Function.call.bind(Element.prototype.matches)

// Returns true if a DOM Element matches a cssRule
const elementMatchCSSRule = (element, cssRule) =>
  matches(element, cssRule.selectorText)

// Returns true if a property is defined in a cssRule
const propertyInCSSRule = (prop, cssRule) =>
  prop in cssRule.style && cssRule.style[prop] !== ''

// Here we get the cssRules across all the stylesheets in one array
const cssRules = slice(document.styleSheets).reduce(
  (rules, styleSheet) => [...rules, ...slice(styleSheet.cssRules)],
  [],
)

function hasSize(element) {
  // get only the css rules that matches that element
  const elementRules = cssRules.filter(elementMatchCSSRule.bind(null, element))

  // check if the property "width" is in one of those rules
  const hasWidth = elementRules.some(propertyInCSSRule.bind(null, 'width'))
  const hasHeight = elementRules.some(propertyInCSSRule.bind(null, 'height'))

  return { hasWidth, hasHeight }
}

export default hasSize
