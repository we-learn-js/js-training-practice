import Question from './Question'
import EventEmitter from 'events'

/**
 * The model of the quiz.
 * It stores responses and return them when requested
 * Observable
 */
export default class UserQuiz extends EventEmitter {

  get PROGRESS_EVENT () { return 'progress' }

  /**
   * @param  {Question[]} questions
   */
  constructor (questions) {
    super()

  }

  /**
   * Gets info from the storage to set the quiz state to a stored one
   * @return {UserQuiz} this
   */
  init () {

  }

  /**
   * Add response of the user.
   * Emits a progress event
   * @param {Numver} questionIndex
   * @param {String|Array} response
   */
  addResponse (questionIndex, response) {

  }

  /**
   * Stored quiz state
   */
  save () {

  }

  /**
   * Reset the quiz
   * Emits a progress event
   */
  reset () {

  }

  /**
   * Get current progress of the quiz
   * @return {Number} Between 0 and 1
   */
  getProgress () {

  }

  /**
   * Returns a question of the quiz
   * @param  {Number} questionIndex
 * @return {Question}
   */
  getQuestion (questionIndex) {

  }
}
