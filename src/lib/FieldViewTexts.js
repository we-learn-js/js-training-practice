import FieldView from './FieldViewAbstract'

/**
 * Composite Pattern
 * In charge of quiz fields management
 */
class FieldViewTexts extends FieldView {

  /**
   * Template method
   * Used by child classes to define its markup
   * @return {String} Html string
   */
  _createMarkup () {
      return '<input type="text" id="'+this._id+'">'
  }

  /**
   * Retrive value of composed field
   * @return {Array} Value(s) of the inputs
   */
  getValue () {

  }

}

export default FieldViewTexts
