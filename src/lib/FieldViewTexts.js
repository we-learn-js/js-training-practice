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
    this.optionsIds = []
    var markup = '<table>'
    this._options.forEach((option, i) => {
      var optionId = this._id + '_' + i
      markup += '<tr>'
        + '<td><label for="' + optionId + '">' + option.label + '</label></td>'
        + '<td width="15px"></td>'
        + '<td><div class="ui input">'
        + '<input type="text" placeholder="Response..." name="' + this._id + '" id="' + optionId + '" value="" />'
        + '</div></td>'
        + '</tr>'
        + '<tr><td colspan="3">&nbsp;</tr></tr>'
      this.optionsIds.push(optionId)
    })
    markup += '</table>'

    return markup
  }

  /**
   * Retrive value of composed field
   * @return {Array} Value(s) of the inputs
   */
  getValue () {
    var result = []
    this.optionsIds.map(function (optionId) {
      var elem = document.getElementById(optionId)
      elem.value && result.push(elem.value)
    })
    if (result.length === 0)
      return null
    return result
  }

}

export default FieldViewTexts
