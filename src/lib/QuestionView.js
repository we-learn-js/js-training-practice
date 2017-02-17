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
    this._question = question
    const elementId = IdFactory.getId()
    this._questionElement = DOM.createDomElement('<div id="' + elementId + '" class="ui card" style="width: 100%;">'
    + '<div class="content">'
    + '<div class="header">' + question.getStatement() + '</div>'
    + '</div>')

    this._answers = FieldViewFactory.createField(question)
  }

  /**
   * Hide question in DOM
   */
  hide () {
    DOM.css(this._questionElement,'display', 'none')
  }

  /**
   * Show question in DOM
   */
  show () {
    DOM.css(this._questionElement,'display', '')
  }

  /**
   * Get response fill in by user
   * @return {String/Array}
   */
  getResponse () {
    this._answers.getValue()
  }

  /**
   * Get HTMLElement for the given question
   * @return {HTMLElement} Element to add to DOM
   */
  getElement () {
    return this._questionElement
  }
}

export default QuestionView
