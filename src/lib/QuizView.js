import EventEmitter from 'events'
import DOM from './DOM'
import ProgressView from './ProgressView'
import QuestionView from './QuestionView'

function createTitleElement (title) {
  return DOM.createDomElement('<h1 class="ui header">' + title + '</h1>')
}

/**
 * Builds and manages the view of the quiz
 */
class QuizView extends EventEmitter {

  get SUBMIT_EVENT () { return 'submit' }
  get RESET_EVENT () { return 'reset' }

  /**
   * @param  {Question[]} questions[]
   */
  constructor (title, questions) {
    super()

  }

  /**
   * Shows given question
   * @param  {Number} index
   */
  showQuestion (index) {

  }

  /**
   * Get response if a question
   * @param  {Number} index
   * @return {String|Array}
   */
  getResponse (index) {

  }

  /**
   * Get HTMLElement for the given quiz
   * @return {HTMLElement} Element to add to DOM
   */
  getElement () {
    return this._element
  }

  /**
   * Set the progress of the quiz in the view
   * If the percentage is 1, it should display an ending message
   * @param {Number} percentage
   */
  setProgress (percentage) {

  }
}

export default QuizView
