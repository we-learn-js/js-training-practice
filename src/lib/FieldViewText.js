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

  }

  getValue () {

  }
}

export default FieldViewText
