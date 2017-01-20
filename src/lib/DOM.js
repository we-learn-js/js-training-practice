/**
 * Façade Pattern
 * Responsible for DOM Manipulation
 */
class DOM {

  /**
   * Create DOM element from HTML markup string
   * @return {HTMLElement}
   */
  createDomElement(HTMLString) {
  }

  /**
   * Append DOM elements to an element container
   * @param  {HTMLElement} parent Parent element
   * @param  {HTMLElement} child Child element to add
   * @return {HTMLElement} Parent Element
   */
  append(parent, ...children) {}

  /**
   * Set property of element style
   * @param  {HTMLElement} element
   * @param  {String} property
   * @param  {Mixed} value
   * @return {element}
   */
  css(element, property, value) {}

  /**
   * Add event listener to click event on an element
   * @param  {HTMLElement}   element
   * @param  {Function} callback
   * @return {Function} Function to call to remove the event listener (Observer pattern)
   */
  click(element, callback) {}
}

/**
 * Singleton pattern
 */
class IdFactory(){
  /**
   * Get unique id. Used for Html elements identification.
   * @return {String}
   */
  getId() {}
}
