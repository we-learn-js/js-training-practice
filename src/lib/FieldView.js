/**
 * Composite Pattern
 * In charge of quiz fields management
 */
class FieldView {

  /**
   * @param  {String} name
   * @param  {String} label Optional
   */
  contructor(name, label) {}

  /**
   * Set value(s) of the field
   * @param {String|Array} value
   */
  setValue(value){}

  /**
   * Get the value of the field (response of user)
   * @return {String|Array} Value(s) of the field
   */
  getValue(){}

  /**
   * Get HTMLElement for the given field
   * @return {HTMLElement} Element to add to DOM
   */
  getElement(){}
}
