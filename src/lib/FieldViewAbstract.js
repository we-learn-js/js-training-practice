import DOM from './DOM'
import IdFactory from './IdFactory'

/**
 * @abstract
 * Creates view of a field and controls it.
 */
class FieldViewAbstract {

  /**
   * Template method
   * Used by child classes to define its markup
   * @return {String} Html string
   */
  _createMarkup () {

  }

  /**
   * @param  {Object[]} options Array of options object
   * @param  {String} options[].label Label of the option
   */
  constructor (options) {

  }

  /**
   * Get the value of the field (response of user)
   * @return {String|Array} Value(s) of the field
   */
  getValue () {
    throw new Error('FieldViewAbstract.getValue() abstract method not implemented.')
  }

  /**
   * Get HTMLElement for the given field
   * @return {HTMLElement} Element to add to DOM
   */
  getElement () {
    return this._element
  }
}

export default FieldViewAbstract
