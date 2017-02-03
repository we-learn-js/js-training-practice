/**
 * Façade Pattern
 * Responsible for DOM Manipulation
 */

export default class Dom {

  static createDomElement(HTMLString) {
    return $(HTMLString)
  }

  static append(parent, ...children) {
    return $(parent).append(children)
  }

  static css(element, property, value) {
    $(element).css(property,value)
  }

  static click(element, callback) {
    return element.addEventListener("click",callback,true)
  }

}
