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
    return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="' + this._id + '" id="' + this._id + '" value="" />'
    + '</div>'
  }

  getValue () {
    var elem = document.getElementById(this._id)
    return elem.value || null
  }
}

export default FieldViewText
