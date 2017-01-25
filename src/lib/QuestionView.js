import DOM from './DOM'

/* MVC Pattern */

/**
 * Represents a Question in the DOM
 */
class QuestionView {

  /**
   * @param  {Question} question
   */
  constructor(question) {
    this._question = question
  }

  /**
   * Hide question in DOM
   */
  hide(){}

  /**
   * Show question in DOM
   */
  show(){}

  /**
   * Get HTMLElement for the given question
   * @return {HTMLElement} Element to add to DOM
   */
  getElement(){}
}
