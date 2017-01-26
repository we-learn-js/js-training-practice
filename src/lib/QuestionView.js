import DOM from './DOM'
import FieldViewFactory from './FieldViewFactory'
import IdFactory from './IdFactory'

/**
 * Represents a Question in the DOM
 */
class QuestionView {

  /**
   * @param  {Question} question
   */
  constructor (question) {
    this._id = IdFactory.getId()
    this._element = DOM.createDomElement('<div id="' + this._id + '" class="ui card quiz-question" style="width: 100%;">'
      + '<div class="content">'
      + '<div class="header">' + question.getStatement() + '</div>'
      + '</div>'
      + '</div>')
    this._field = FieldViewFactory.createField(question)

    var fieldContainer = DOM.createDomElement('<div class="content"></div>')
    DOM
      .append(fieldContainer, this._field.getElement())
      .append(this._element, fieldContainer)
  }

  /**
   * Hide question in DOM
   */
  hide () {
    DOM.css(this._element, 'display', 'none')
  }

  /**
   * Show question in DOM
   */
  show () {
    DOM.css(this._element, 'display', 'block')
  }

  /**
   * Get response fill in by user
   * @return {String/Array}
   */
  getResponse () {
    return this._field.getValue()
  }

  /**
   * Get HTMLElement for the given question
   * @return {HTMLElement} Element to add to DOM
   */
  getElement () {
    return this._element
  }
}

export default QuestionView
