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
    this.optionsIds = []
    var markup = '<div class="inline fields">'
    this._options.forEach((option, i) => {
      var optionId = this._id + '_' + i
      markup += '<div class="field">'
        + '<div class="ui checkbox ' + this.INPUT_TYPE + '">'
        + '<input type="' + this.INPUT_TYPE + '"  name="' + this._id + '" id="' + optionId + '" value="' + option.label + '">'
        + '<label for="' + optionId + '">' + option.label + '</label>'
        + '</div>'
        + '</div>'
      this.optionsIds.push(optionId)
    })
    markup += '</div>'

    return markup
  }

  /**
   * Retrive value of composed field
   * @return {Array} Value(s) of the field
   */
  getValue () {
    var result = []
    this.optionsIds.map(function (optionId) {
      var elem = document.getElementById(optionId)
      elem.checked && result.push(elem.value)
    })
    if (result.length === 0)
      return null
    return result
  }
}

export default FieldViewRadio
