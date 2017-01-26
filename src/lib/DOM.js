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
    return $(HTMLString).get(0)
  }

  /**
   * Append DOM elements to an element container
   * @param  {HTMLElement} parent Parent element
   * @param  {HTMLElement} child Child element to add
   * @return {HTMLElement} Parent Element
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
   * @return {element}
   */
  static css(element, property, value) {
    $(element).css(property, value)
    return this
  }

  /**
   * Add event listener to click event on an element
   * @param  {HTMLElement}   element
   * @param  {Function} callback
   * @return {Function} Function to call to remove the event listener (Observer pattern)
   */
  static click(element, callback) {
    element.addEventListener('click', callback)
    return this
  }
}

export default DOM
