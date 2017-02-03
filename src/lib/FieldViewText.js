import FieldView from './FieldViewAbstract'

/**
 * Composite Pattern
 * In charge of quiz fields management
 */
class FieldViewText extends FieldView {

  /**
   * Template method
   * Used by child classes to define its markup
   * @return {String} Html string
   */
  _createMarkup () {
      return '<input type="text" id="'+ this._id +'">'
  }

  getValue () {
    return $(document.getElementById(this._id)).val();
  }
}

export default FieldViewText
