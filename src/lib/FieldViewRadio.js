import FieldView from './FieldViewAbstract'

/**
 * In charge of quiz fields management with multiple options
 */
class FieldViewRadio extends FieldView {

  get INPUT_TYPE () { return 'radio' }

  /**
   * Template method
   * Used by child classes to define its markup
   * @return {String} Html string
   */
  _createMarkup () {

  }

  /**
   * Retrive value of composed field
   * @return {Array} Value(s) of the field
   */
  getValue () {

  }
}

export default FieldViewRadio
