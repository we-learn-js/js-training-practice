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
      return "<input type='"+INPUT_TYPE+"' id='" + this._id + "'>"
  }

  /**
   * Retrive value of composed field
   * @return {Array} Value(s) of the field
   */
  getValue () {
    return  $(document.getElementById(this._id)).val()
  }
}

export default FieldViewRadio
