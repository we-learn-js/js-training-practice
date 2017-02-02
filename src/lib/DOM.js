/**
 * Façade Pattern
 * Responsible for DOM Manipulation
 */
class DOM {

  /**
   * Create DOM element from HTML markup string
   * @return {HTMLElement}
   */
  static createDomElement(HTMLString) {
    return document.createElement(HTMLString)
  }

  /**
   * Append DOM elements to an element container
   * @param  {HTMLElement} parent Parent element
   * @param  {HTMLElement} child Child element to add
   * @return {DOM} this
   */
  static append(parent, ...children) {
    $(parent).append(children)
    return this
  }

  /**
   * Set property of element style
   * @param  {HTMLElement} element
   * @param  {String} property
   * @param  {Mixed} value
   * @return {DOM} this
   */
  static css(element, property, value) {
    $(element).css(property, value)
    return this
  }

  /**
   * Add event listener to click event on an element
   * @param  {HTMLElement}   element
   * @param  {Function} callback
   * @return {DOM} this
   */
  static click(element, callback) {
    element.addEventListener('click', callback)
    return this
  }
}

export default DOM
