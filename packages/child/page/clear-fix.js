export default function injectClearFixIntoBodyElement() {
  const clearFix = document.createElement('div')

  clearFix.style.clear = 'both'
  // Guard against the following having been globally redefined in CSS.
  clearFix.style.display = 'block'
  clearFix.style.height = '0'

  document.body.append(clearFix)
}
